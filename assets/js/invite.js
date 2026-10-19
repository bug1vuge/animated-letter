import config from './config.js';
import { createPlayer } from './player.js';
import { readRecipient } from './recipient.js';

const desk = document.querySelector('.desk');
const scene = document.querySelector('.scene');
const stage = document.querySelector('.stage');
const envelope = document.querySelector('.envelope');
const flap = document.querySelector('.envelope__flap');
const flapShadow = document.querySelector('.envelope__flap-shadow');
const slot = document.querySelector('.envelope__slot');
const hint = document.querySelector('.scene__hint');
const reading = document.querySelector('.reading');
const letter = document.querySelector('.letter');
const player = document.querySelector('.player');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/** @param {string} key */
const bound = (key) => document.querySelector(`[data-bind="${key}"]`);

/* --------------------------------------------------------------------------
   Content
   -------------------------------------------------------------------------- */

const name = readRecipient(window.location.href);

/** @param {string} template */
const personalise = (template) => template.replaceAll('{name}', name);

function render() {
  const { envelope: env, letter: copy } = config;

  // All text goes in through textContent, so a name can never become markup.
  bound('return-address').textContent = env.returnAddress;
  bound('hand-mark').textContent = env.handMark;
  bound('seal').textContent = env.seal;

  const envelopeName = bound('envelope-name');
  if (name) {
    envelopeName.textContent = name;
    envelopeName.style.setProperty('--name-length', String(Math.max(4, name.length)));
    bound('envelope-label').textContent = `A letter for ${name}. Open the envelope.`;
    document.title = `A letter for ${name}`;
  } else {
    envelopeName.textContent = env.fallbackName;
    envelopeName.dataset.fallback = '';
    bound('envelope-label').textContent = 'A letter for you. Open the envelope.';
  }

  bound('wordmark').textContent = config.title;
  bound('date').textContent = copy.date;
  bound('greeting').textContent = name ? personalise(copy.greeting) : copy.fallbackGreeting;

  const body = bound('body');
  body.replaceChildren(
    ...copy.body.map((paragraph) => {
      const p = document.createElement('p');
      p.textContent = name ? personalise(paragraph) : paragraph.replaceAll('{name}', '').trim();
      return p;
    }),
  );

  bound('valediction').textContent = copy.valediction;
  bound('signature').textContent = copy.signature;
}

/* --------------------------------------------------------------------------
   Tilt: the envelope leans gently toward a mouse pointer
   -------------------------------------------------------------------------- */

function enableTilt() {
  if (!finePointer.matches || reducedMotion.matches) return () => {};

  const onMove = (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    envelope.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`);
    envelope.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`);
  };
  window.addEventListener('pointermove', onMove);

  return () => {
    window.removeEventListener('pointermove', onMove);
    envelope.style.setProperty('--tilt-x', '0deg');
    envelope.style.setProperty('--tilt-y', '0deg');
  };
}

/* --------------------------------------------------------------------------
   Opening
   -------------------------------------------------------------------------- */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs a Web Animation and resolves when it finishes, keeping its end state.
 * @param {Element} el
 * @param {Keyframe[]} keyframes
 * @param {KeyframeAnimationOptions} options
 */
function play(el, keyframes, options) {
  return el.animate(keyframes, {
    fill: 'forwards',
    easing: 'cubic-bezier(.22,.61,.2,1)',
    ...options,
  }).finished;
}

/**
 * Puts a scaled copy of the letter inside the envelope, so the paper that
 * slides out is exactly the letter that will be read.
 */
function placeLetterInEnvelope() {
  const width = letter.getBoundingClientRect().width;
  const copy = letter.cloneNode(true);
  copy.removeAttribute('tabindex');
  copy.setAttribute('aria-hidden', 'true');
  copy.querySelector('.player')?.remove();
  copy.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  copy.style.width = `${width}px`;
  copy.style.transform = `scale(${slot.clientWidth / width})`;
  slot.replaceChildren(copy);
  return copy;
}

/** Moves the reading letter so it sits exactly over `target`, then lets it go. */
async function handOver(target) {
  const from = target.getBoundingClientRect();
  const to = letter.getBoundingClientRect();
  const scale = from.width / to.width;
  const dx = from.left - to.left;
  const dy = from.top - to.top;

  reading.removeAttribute('data-staging');
  target.style.visibility = 'hidden';

  await Promise.all([
    play(
      letter,
      [
        { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transformOrigin: '0 0', transform: 'none' },
      ],
      { duration: 1300, easing: 'cubic-bezier(.45,.05,.2,1)' },
    ),
    play(
      stage,
      [
        { transform: 'none', opacity: 1 },
        { transform: 'translate3d(0, 55svh, 0) rotateX(18deg)', opacity: 0 },
      ],
      { duration: 1100, easing: 'cubic-bezier(.55,0,.6,1)' },
    ),
  ]);
}

async function openWithMotion() {
  play(hint, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 });

  // Let the tilt settle back to level before turning the envelope over.
  await wait(finePointer.matches ? 250 : 0);
  envelope.style.transition = 'none';

  // 1. Turn it over.
  await play(
    envelope,
    [
      { transform: 'rotateY(0deg)' },
      { transform: 'translateZ(60px) rotateY(90deg)', offset: 0.5 },
      { transform: 'rotateY(180deg)' },
    ],
    { duration: 1300 },
  );

  // 2. Lift the flap.
  play(flapShadow, [{ opacity: 0.32 }, { opacity: 0 }], { duration: 300 });
  await play(
    flap,
    [
      { transform: 'translateZ(3px) rotateX(0deg)' },
      { transform: 'translateZ(3px) rotateX(90deg)', offset: 0.5 },
      // Once open, the flap drops behind the letter so the letter can pass over it.
      { transform: 'translateZ(-1px) rotateX(180deg)' },
    ],
    { duration: 900, easing: 'cubic-bezier(.5,0,.25,1)' },
  );

  // 3. Draw the letter out.
  const inside = placeLetterInEnvelope();
  await play(
    inside,
    [{ translate: '0 0' }, { translate: `0 -${Math.round(stage.clientHeight * 0.66)}px` }],
    { duration: 1100, delay: 80, easing: 'cubic-bezier(.4,0,.2,1)' },
  );

  // 4. Hand the letter over and let the envelope fall away.
  await handOver(inside);
}

async function openWithoutMotion() {
  await play(scene, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: 'ease' });
  reading.removeAttribute('data-staging');
  await play(letter, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease' });
}

let disableTilt = () => {};

async function open() {
  if (desk.dataset.state !== 'ready') return;
  desk.dataset.state = 'opening';
  disableTilt();

  // Lay the letter out invisibly so it can be measured.
  reading.dataset.staging = '';
  reading.hidden = false;
  player.style.opacity = '0';

  try {
    if (reducedMotion.matches) {
      await openWithoutMotion();
    } else {
      await openWithMotion();
    }
  } finally {
    reading.removeAttribute('data-staging');
    scene.hidden = true;
    scene.style.display = 'none';
    desk.dataset.state = 'open';
    letter.focus({ preventScroll: true });
  }

  play(player, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease' });
}

/* --------------------------------------------------------------------------
   Start
   -------------------------------------------------------------------------- */

render();
createPlayer(player, config.audio);

envelope.addEventListener('click', open);

// Wait for the type before the envelope arrives, so nothing reflows in view.
Promise.race([document.fonts.ready, wait(1500)]).then(() => {
  desk.dataset.state = 'ready';
  disableTilt = enableTilt();
});
