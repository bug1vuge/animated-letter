import { buildInviteUrl, normaliseName } from './recipient.js';

const form = document.querySelector('.composer');
const results = document.querySelector('.results');
const count = document.querySelector('.results__count');
const list = document.querySelector('.links');
const rowTemplate = document.querySelector('#link-row');

/** The invitation lives next to this page, at ../invite/ */
const INVITE_BASE = new URL('../invite/', window.location.href);

/** @type {{ name: string, url: string }[]} */
let links = [];

function readNames() {
  const seen = new Set();
  return form.elements.names.value
    .split(/[\n,;]+/)
    .map(normaliseName)
    .filter((name) => name && !seen.has(name) && seen.add(name));
}

function update() {
  const disguise = form.elements.disguise.checked;
  links = readNames().map((name) => ({
    name,
    url: buildInviteUrl(INVITE_BASE, name, { disguise }),
  }));

  list.replaceChildren(
    ...links.map(({ name, url }) => {
      const row = rowTemplate.content.firstElementChild.cloneNode(true);
      row.querySelector('.link__name').textContent = name;
      const anchor = row.querySelector('.link__url');
      anchor.href = url;
      anchor.textContent = decodeURI(url);
      row
        .querySelector('.link__copy')
        .addEventListener('click', (event) => copy(url, event.currentTarget));
      return row;
    }),
  );

  results.hidden = links.length === 0;
  count.textContent = links.length === 1 ? '1 link' : `${links.length} links`;
}

/**
 * @param {string} text
 * @param {HTMLButtonElement} button
 */
async function copy(text, button) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';
  } catch {
    button.textContent = 'Copy failed — select the link instead';
  }
  setTimeout(() => {
    button.textContent = original;
  }, 1600);
}

/** @param {string} value */
const csvCell = (value) => `"${value.replaceAll('"', '""')}"`;

function download() {
  const rows = [['Name', 'Link'], ...links.map(({ name, url }) => [name, url])];
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const anchor = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'invitation-links.csv',
  });
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

form.addEventListener('input', update);
form.addEventListener('submit', (event) => event.preventDefault());

document
  .querySelector('[data-action="copy-all"]')
  .addEventListener('click', (event) =>
    copy(links.map(({ name, url }) => `${name}: ${url}`).join('\n'), event.currentTarget),
  );
document.querySelector('[data-action="download"]').addEventListener('click', download);

update();
