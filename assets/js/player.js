/**
 * A voice-note player that is mostly typography: a LISTEN / PAUSE word, a
 * hairline that fills as the note plays, and the time.
 *
 * Built on a plain <audio> element so it works everywhere, including iOS
 * Safari in silent mode, and nothing plays until the recipient asks for it.
 */

/** @param {number} seconds */
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

const LABELS = {
  idle: 'Listen',
  loading: 'Listen',
  playing: 'Pause',
  paused: 'Resume',
  ended: 'Again',
  error: 'Listen',
};

/**
 * @param {HTMLElement} root  the .player element
 * @param {{ src: string, title?: string, artist?: string }} options
 */
export function createPlayer(root, { src, title = '', artist = '' }) {
  const audio = root.querySelector('audio');
  const toggle = root.querySelector('.player__toggle');
  const label = root.querySelector('.player__label');
  const seek = root.querySelector('.player__seek');
  const time = root.querySelector('.player__time');

  audio.src = src;
  let frame = 0;
  let seeking = false;

  /** @param {keyof LABELS} state */
  function setState(state) {
    root.dataset.state = state;
    label.textContent = LABELS[state];
    toggle.setAttribute('aria-pressed', String(state === 'playing'));
    toggle.setAttribute('aria-label', state === 'playing' ? 'Pause voice note' : 'Play voice note');
  }

  function showDuration() {
    time.textContent = formatTime(audio.duration);
  }

  function draw() {
    const { currentTime, duration } = audio;
    const progress = duration ? currentTime / duration : 0;
    root.style.setProperty('--progress', progress.toFixed(4));
    if (!seeking) seek.value = String(progress * 100);
    seek.setAttribute('aria-valuetext', `${formatTime(currentTime)} of ${formatTime(duration)}`);
    // Counts down while playing, so the hairline and the number agree.
    time.textContent = formatTime(Math.max(0, duration - currentTime));
  }

  function tick() {
    draw();
    frame = requestAnimationFrame(tick);
  }

  async function start() {
    if (root.dataset.state === 'idle') setState('loading');
    try {
      await audio.play();
    } catch (error) {
      // AbortError just means a pause interrupted the play request.
      if (error?.name !== 'AbortError') fail();
    }
  }

  function fail() {
    setState('error');
    time.textContent = 'Unavailable';
  }

  toggle.addEventListener('click', () => {
    if (audio.paused) start();
    else audio.pause();
  });

  seek.addEventListener('input', () => {
    seeking = true;
    if (audio.duration) {
      audio.currentTime = (Number(seek.value) / 100) * audio.duration;
      draw();
    }
  });
  seek.addEventListener('change', () => {
    seeking = false;
  });

  audio.addEventListener('loadedmetadata', () => {
    if (root.dataset.state === 'idle') showDuration();
  });

  audio.addEventListener('playing', () => {
    setState('playing');
    cancelAnimationFrame(frame);
    tick();
  });

  audio.addEventListener('pause', () => {
    cancelAnimationFrame(frame);
    if (!audio.ended) setState('paused');
    draw();
  });

  audio.addEventListener('ended', () => {
    cancelAnimationFrame(frame);
    setState('ended');
    root.style.setProperty('--progress', '1');
    showDuration();
  });

  audio.addEventListener('error', fail);

  // Lock-screen / browser media controls show something meaningful.
  if ('mediaSession' in navigator && title) {
    audio.addEventListener(
      'play',
      () => {
        navigator.mediaSession.metadata = new MediaMetadata({ title, artist });
      },
      { once: true },
    );
  }

  setState('idle');
  return { audio };
}
