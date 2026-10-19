# Sending invitations

No technical knowledge needed. You can make a link in a few seconds in either of two ways.

## The link maker (recommended)

1. Open the link maker: `https://<your-site>/compose/`.
   For the demo, this is <https://bug1vuge.github.io/animated-letter/compose/>.
2. Type first names in the box, one per line. You can also paste a column copied from a spreadsheet.
3. A link appears under each name.
   - **Copy** copies that one link.
   - **Copy all links** copies every name with its link, ready to paste into a document.
   - **Download spreadsheet (CSV)** saves a file you can open in Excel, Numbers or Google Sheets, or use for a mail merge.
4. Paste each link into your email or message.

Tick **Hide names in the links** if you'd rather the name wasn't visible in the link itself. The invitation looks exactly the same either way.

## Typing a link by hand

Add `?name=` and the first name to the invitation address:

```
https://<your-site>/invite/?name=Josh
```

- Capitals don't matter: `josh`, `JOSH` and `Josh` all show as Josh. Names with deliberate capitals, like `DeShawn`, are kept as written.
- Names with spaces, accents and other alphabets work: `?name=Anna Lise`, `?name=Zoë`, `?name=Анна`.
- Without a name, the envelope says "For you" and the letter opens with "Hello,".

## Before you send

- Open the link yourself first to check the name looks right.
- Every message preview (iMessage, WhatsApp, email) shows the same envelope image with no name on it. That's intentional.
- Nothing is recorded about who you invited. Keep your own list, for example the CSV from the link maker.

## Changing the letter or the voice note

All the wording is in one file, `assets/js/config.js`. Edit the text between the quotes and keep the quotes and commas as they are. To swap the voice note, replace `assets/audio/voice-note.mp3` with a new MP3 of the same name. Once the change is saved to the hosted site, every existing link shows the new version.
