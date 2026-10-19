/**
 * Recipient personalisation.
 *
 * One master invitation, personalised entirely by its link:
 *
 *   /invite/?name=Josh          readable link
 *   /invite/?k=Sm9zaA           "disguised" link — the name is not readable in
 *                               the URL or in a chat app's link preview
 *
 * Nothing about recipients is stored anywhere: the name lives only in the
 * link that is sent, so there is no list of guests to leak.
 *
 * This module is pure (no DOM access) so it can be unit tested in Node.
 */

export const MAX_NAME_LENGTH = 32;

/** Query/hash keys that may carry a readable name, in priority order. */
const NAME_KEYS = ['name', 'to'];
/** Query/hash key that carries an encoded name. */
const TOKEN_KEY = 'k';

/**
 * Turns whatever was typed into a link into a safe, presentable first name.
 * Letters (any script), combining marks, spaces, apostrophes, hyphens and
 * full stops are kept; everything else is dropped.
 *
 * @param {unknown} raw
 * @returns {string} the cleaned name, or '' when nothing usable remains
 */
export function normaliseName(raw) {
  if (typeof raw !== 'string') return '';

  const cleaned = raw
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}\s'’.-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .trim();

  if (!/\p{L}/u.test(cleaned)) return '';

  // "josh" or "JOSH" → "Josh". Deliberate mixed case ("DeShawn") is respected.
  const isSingleCase = cleaned === cleaned.toLowerCase() || cleaned === cleaned.toUpperCase();
  return isSingleCase ? toTitleCase(cleaned) : cleaned;
}

/** @param {string} value */
function toTitleCase(value) {
  return value
    .toLowerCase()
    .replace(/(^|[\s'’.-])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase());
}

/**
 * Encodes a name as a URL-safe token (base64url of its UTF-8 bytes).
 * This is obfuscation, not encryption: it keeps names out of plain sight in
 * link previews and browser history, nothing more.
 *
 * @param {string} name
 * @returns {string}
 */
export function encodeName(name) {
  const bytes = new TextEncoder().encode(name);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * @param {string} token
 * @returns {string} the decoded name, or '' if the token is malformed
 */
export function decodeName(token) {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return '';
  }
}

/**
 * Reads the recipient's name from a URL. Looks at the query string first,
 * then the hash (`#name=Josh`), which is never sent to the server.
 *
 * @param {string | URL} href
 * @returns {string} the normalised name, or '' when none is given
 */
export function readRecipient(href) {
  const url = new URL(href);
  const sources = [url.searchParams, new URLSearchParams(url.hash.replace(/^#/, ''))];

  for (const params of sources) {
    for (const key of NAME_KEYS) {
      const name = normaliseName(params.get(key));
      if (name) return name;
    }
    const token = params.get(TOKEN_KEY);
    if (token) {
      const name = normaliseName(decodeName(token));
      if (name) return name;
    }
  }
  return '';
}

/**
 * Builds a personal link for one recipient.
 *
 * @param {string | URL} base   address of the invitation page
 * @param {string} rawName
 * @param {{ disguise?: boolean }} [options]
 * @returns {string} the link, or '' if the name is not usable
 */
export function buildInviteUrl(base, rawName, { disguise = false } = {}) {
  const name = normaliseName(rawName);
  if (!name) return '';

  const url = new URL(base);
  url.search = '';
  url.hash = '';
  if (disguise) {
    url.searchParams.set(TOKEN_KEY, encodeName(name));
  } else {
    url.searchParams.set('name', name);
  }
  return url.toString();
}
