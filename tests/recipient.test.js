import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  MAX_NAME_LENGTH,
  buildInviteUrl,
  decodeName,
  encodeName,
  normaliseName,
  readRecipient,
} from '../assets/js/recipient.js';

const BASE = 'https://example.com/invite/';

describe('normaliseName', () => {
  it('title-cases single-case input', () => {
    assert.equal(normaliseName('josh'), 'Josh');
    assert.equal(normaliseName('JOSH'), 'Josh');
    assert.equal(normaliseName('mary-jane'), 'Mary-Jane');
    assert.equal(normaliseName("o'neill"), "O'Neill");
  });

  it('respects deliberate mixed case', () => {
    assert.equal(normaliseName('DeShawn'), 'DeShawn');
    assert.equal(normaliseName('McKay'), 'McKay');
  });

  it('keeps letters from any script', () => {
    assert.equal(normaliseName('zoë'), 'Zoë');
    assert.equal(normaliseName('анна'), 'Анна');
    assert.equal(normaliseName('Søren'), 'Søren');
  });

  it('strips markup, digits and symbols', () => {
    assert.equal(normaliseName('<script>alert(1)</script>Josh'), 'scriptalertscriptJosh');
    assert.equal(normaliseName('Josh<b>'), 'Joshb');
    assert.equal(normaliseName('Jo$h 123'), 'Joh');
  });

  it('collapses whitespace and trims', () => {
    assert.equal(normaliseName('   Anna    Lise  '), 'Anna Lise');
  });

  it('caps the length', () => {
    assert.ok(normaliseName('a'.repeat(100)).length <= MAX_NAME_LENGTH);
  });

  it('returns empty string for unusable input', () => {
    assert.equal(normaliseName(''), '');
    assert.equal(normaliseName('  '), '');
    assert.equal(normaliseName('123'), '');
    assert.equal(normaliseName("'-."), '');
    assert.equal(normaliseName(null), '');
    assert.equal(normaliseName(undefined), '');
  });
});

describe('encodeName / decodeName', () => {
  it('round-trips ASCII and Unicode', () => {
    for (const name of ['Josh', 'Zoë', 'Анна', 'Mary-Jane']) {
      assert.equal(decodeName(encodeName(name)), name);
    }
  });

  it('produces URL-safe tokens', () => {
    assert.match(encodeName('Анна Søren ÿ?'), /^[A-Za-z0-9_-]+$/);
  });

  it('returns empty string for malformed tokens', () => {
    assert.equal(decodeName('%%%'), '');
    assert.equal(decodeName('_w'), ''); // decodes to invalid UTF-8
  });
});

describe('readRecipient', () => {
  it('reads ?name= and ?to=', () => {
    assert.equal(readRecipient(`${BASE}?name=Josh`), 'Josh');
    assert.equal(readRecipient(`${BASE}?to=josh`), 'Josh');
  });

  it('decodes percent-encoded names', () => {
    assert.equal(readRecipient(`${BASE}?name=Zo%C3%AB`), 'Zoë');
    assert.equal(readRecipient(`${BASE}?name=Anna+Lise`), 'Anna Lise');
  });

  it('reads disguised ?k= tokens', () => {
    assert.equal(readRecipient(`${BASE}?k=${encodeName('Josh')}`), 'Josh');
  });

  it('reads names from the hash', () => {
    assert.equal(readRecipient(`${BASE}#name=Josh`), 'Josh');
    assert.equal(readRecipient(`${BASE}#k=${encodeName('Zoë')}`), 'Zoë');
  });

  it('returns empty string when there is no usable name', () => {
    assert.equal(readRecipient(BASE), '');
    assert.equal(readRecipient(`${BASE}?name=`), '');
    assert.equal(readRecipient(`${BASE}?k=%%%`), '');
  });
});

describe('buildInviteUrl', () => {
  it('builds a readable link', () => {
    assert.equal(buildInviteUrl(BASE, ' josh '), `${BASE}?name=Josh`);
  });

  it('builds a disguised link that reads back to the same name', () => {
    const link = buildInviteUrl(BASE, 'Zoë', { disguise: true });
    assert.doesNotMatch(link, /Zo/);
    assert.equal(readRecipient(link), 'Zoë');
  });

  it('replaces any existing query or hash on the base', () => {
    assert.equal(buildInviteUrl(`${BASE}?name=Old#x`, 'New'), `${BASE}?name=New`);
  });

  it('returns empty string for an unusable name', () => {
    assert.equal(buildInviteUrl(BASE, '42'), '');
  });
});
