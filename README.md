# Animated letter

A personal letter that arrives on screen the way a real one arrives in your hands. The recipient opens a private link and finds an envelope addressed to them. One tap turns it over, lifts the flap and draws out a letter with their name on it. At the foot of the letter, LISTEN plays a short voice note from the sender without leaving the page.

One master letter serves every recipient. The name comes from the link, so writing to someone new takes seconds and no code.

**Live demo**

- [A letter for Anna](https://bug1vuge.github.io/animated-letter/invite/?name=Anna)
- [The same letter, name hidden in the link](https://bug1vuge.github.io/animated-letter/invite/?k=QW5uYQ)
- [The letter with no name](https://bug1vuge.github.io/animated-letter/invite/)
- [Link maker](https://bug1vuge.github.io/animated-letter/compose/)

> Concept project. _Maison Orée_ is a fictional perfume house inviting a few clients to preview its winter scent. The copy and the voice note were written for this demo.

## Features

- **Opening sequence.** The envelope turns over, the flap lifts and the letter slides out, then comes forward to be read. It's one choreographed sequence built with CSS 3D and the Web Animations API. The paper that leaves the envelope is the real letter, scaled, so the hand-off is seamless.
- **Personal links.** `/invite/?name=Anna` writes ANNA on the envelope and _Anna,_ at the top of the letter. `?to=Anna`, `#name=Anna` and a hidden form, `?k=QW5uYQ`, work too. Names in any script are supported.
- **Voice note.** A native `<audio>` element sits behind a typographic control: LISTEN, a hairline that fills, a countdown. It plays inside the page on iPhone and Android, can be scrubbed and shows on the lock screen. Nothing plays until it is pressed.
- **Link maker.** At `/compose/`, paste a list of names to get a link for each. Copy one, copy them all, or download a CSV for a mail merge. See [docs/SENDING.md](docs/SENDING.md).
- **Phones first.** The envelope's type scales with the envelope (container query units), and the letter scrolls on short screens. Layout respects the safe areas.
- **Private by design.** Pages carry `noindex`, nothing is stored about recipients, and link previews never show a name. See [Privacy](#privacy).
- **Small and portable.** Plain static files with no framework, build step or third-party services.

There's also a reduced-motion version (a cross-fade instead of the sequence), keyboard and screen-reader support, and self-hosted fonts. The page is about 40 KB of uncompressed HTML, CSS and JS, and the fonts add about 280 KB. The voice note is about 420 KB; only its length is fetched until LISTEN is pressed.

## Changing the content

Everything editable is in [`assets/js/config.js`](assets/js/config.js): the title, the envelope wording, the letter paragraphs, the sign-off and the audio file. Writing `{name}` anywhere inserts the recipient's name.

To replace the voice note, put the recording at `assets/audio/voice-note.mp3`, or point `audio.src` at another file. Use MP3 so it plays in every browser. Mono at 96–128 kbps is plenty for a voice.

## Privacy

Privacy needs no effort from the recipient:

1. **No index.** Every page has `noindex` and `robots.txt` blocks all crawling. On Netlify, Cloudflare Pages or Vercel, an `X-Robots-Tag` header is sent as well (`_headers`, `vercel.json`).
2. **No guest list.** Names are never stored. Each name exists only in the link sent to that person, so there's nothing to leak and no directory to find.
3. **Quiet links.** Turning on _Hide names in the links_ in the link maker keeps names out of chat previews and browser history. Link previews always show the same unaddressed envelope. `Referrer-Policy: no-referrer` stops the page address from being passed on to other sites.
4. **No third parties.** Fonts and audio are served from the same host. Nothing sends visitor data anywhere else.

For more protection, the next step is a hard-to-guess path (for example `/invite-7f3k9/`) or platform password protection on `/compose/` only. Both keep the recipient's experience to a single tap.

## Hosting

The site is static. Deploy the repository root to any of these:

- **Netlify / Cloudflare Pages**: connect the repo with no build command, output directory `/`. Headers come from `_headers`.
- **Vercel**: import the repo with the framework preset _Other_. Headers come from `vercel.json`.
- **GitHub Pages**: already set up in `.github/workflows/pages.yml`, which this demo uses. Pages can't send custom headers, so it relies on the meta tags and `robots.txt`.

After moving to a custom domain, update the absolute `og:image` URL in `invite/index.html` so link previews show the envelope.

## Project structure

```
invite/index.html        the invitation
compose/index.html       link maker for the team
assets/js/config.js      all editable copy and the audio path
assets/js/invite.js      rendering and the opening sequence
assets/js/player.js      voice-note player
assets/js/recipient.js   reading, cleaning and encoding names (unit tested)
assets/css/              fonts.css, invite.css, compose.css
assets/audio/            the voice note
assets/fonts/            Newsreader (SIL Open Font License)
scripts/                 font copy script
tests/                   node:test unit tests
```

## Development

Requires Node 20 or later.

```sh
npm install
npm run dev      # http://localhost:5173/invite/?name=Anna
npm test         # unit tests for name handling
npm run lint     # ESLint + Prettier
```

CI runs lint and tests on every push and pull request. Pushing to `main` deploys the demo to GitHub Pages.

## Browser support

The current versions of Safari (iOS and macOS), Chrome, Firefox and Edge are supported. The sequence relies on CSS 3D transforms, container query units and the Web Animations API, which have been available in all of them since 2023.
