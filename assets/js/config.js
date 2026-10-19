/**
 * Everything a non-developer may want to change lives in this file.
 *
 * - Edit the text between the quotes. Keep the quotes and commas.
 * - Write {name} anywhere to insert the recipient's first name.
 * - Paragraphs of the letter go in `body`, one string per paragraph.
 *
 * The copy below is placeholder text for the demo: Maison Orée is a
 * fictional perfume house.
 */
export default {
  /** The sender's name, shown at the top of the letter. */
  title: 'Maison Orée',

  envelope: {
    /** Written top-left, where a return address would go. */
    returnAddress: 'from Maison Orée',
    /** The small boxed note top-right, in place of a stamp. */
    handMark: 'By hand',
    /** Shown instead of a name when a link has no name in it. */
    fallbackName: 'For you',
    /** Monogram blind-embossed on the flap. Keep it to one or two letters. */
    seal: 'mo',
  },

  letter: {
    /** Shown top-right of the letter. Leave empty ('') to hide. */
    date: 'November 2026',
    greeting: '{name},',
    /** Used when a link has no name in it. */
    fallbackGreeting: 'Hello,',
    body: [
      'Every winter we make one scent, and only a few hundred bottles of it. This year’s began on a walk along the harbour: wet rope, cold stone, and somebody’s fire a long way off.',
      'It doesn’t have a name yet. Before it has one, I wanted you to hear about it from me, and to ask you to the studio on the twelfth of December, a week before anyone else.',
      'There’s a short note from me below. Somewhere quiet is best.',
    ],
    valediction: 'Until soon,',
    signature: 'Ines',
  },

  audio: {
    /** Path to the voice note, relative to the invite page. MP3 plays everywhere. */
    src: '../assets/audio/voice-note.mp3',
    /** Shown on phone lock screens and in browser media controls while playing. */
    title: 'A note from Ines',
    artist: 'Maison Orée',
  },
};
