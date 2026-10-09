# Client intake

The WhatsApp message Sandeep sends a couple to collect everything a new
invitation needs, and where each answer goes in `src/data.js`. A Claude
session filling a couple repo should map the couple's reply with the table at
the bottom, then follow `docs/NEW-COUPLE-GUIDE.md`.

## The message (copy into WhatsApp)

```text
Hi! 😊 Congratulations once again! I'd love to make your digital wedding invitation.

It's a small website your guests open on their phone: an opening envelope, your names, a short film for each function, venue maps, a countdown, and RSVP straight to WhatsApp. The bride's and groom's families each get their own version to share with their guests, and you can choose which functions each guest sees. It stays off Google, so only people with the link can open it.

To build it I need the details below. Send them whenever you can, in parts or as voice notes, whatever is easiest.

*1. The couple*
• Bride's and groom's names, exactly as you want them on the invite
• A wedding hashtag, if you have one

*2. The main ceremony*
• Date and time of the pheras / main ceremony (the countdown counts to this)

*3. Each family's invitation* (please send for the bride's side and the groom's side)
• Who is inviting, e.g. "Mrs. & Mr. Rajesh Mehta" or "The Mehta Family"
• Parents' line under each name, e.g. "D/o Mrs. Neha & Mr. Rajesh Mehta"
• Any prayer or blessing line at the top, e.g. "॥ श्री गणेशाय नमः ॥" or "Ik Onkar", and whether you'd like the Ganesha image
• Closing line, e.g. "With love, the Mehta Family"
• 1–2 names and numbers guests can call
• The WhatsApp number where this side's RSVPs should arrive

*4. Functions* (for each one)
• Name, e.g. Mehndi, Haldi, Sangeet, Wedding, Reception
• Date and time
• Venue name, address and Google Maps link
• Bride's side, groom's side, or both families together
• Dress code or colour theme, if any

*5. For the films*
• A few photos of you both, and any videos you love
• A song you'd like as background music
• Anything special you'd like in a particular function's film

*6. Look and feel*
• A photo of your printed card, or colours you like
• English only, or Hindi / Punjabi lines too

*7. Guest groups*
• Which guests get which functions, e.g. "office friends: Sangeet and Wedding only", so I can set up quick picks for you

Once I have these I'll send you a preview link to check before anything goes out. 🙏
```

## Where each answer goes

| Answer | `src/data.js` | Notes |
| --- | --- | --- |
| Names | `couple.bride.first/full`, `couple.groom.first/full` | |
| Hashtag | `couple.hashtag` | |
| Main ceremony date/time | `wedding.dateTimeISO`, `wedding.dateLabel`, `wedding.dayLabel` | Check the weekday |
| Who is inviting (per side) | `families.bride.hosts`, `families.groom.hosts`, and `families.joint.hosts` (both families, e.g. "The Mehta & Kapoor Families") | |
| Parents' lines | `families.<side>.parents.bride` / `.groom` | Fill both keys in every side's block |
| Blessing line | `families.<side>.ganesha` (array of lines) or `.invocation` (one line) | Omit for none |
| Ganesha image yes/no | `config.showGanesha` | One setting for all sides |
| Closing line | `families.<side>.sign` | |
| Contact numbers | `families.<side>.contacts` | `+` and country code |
| RSVP WhatsApp per side | `families.bride.rsvpWhatsApp`, `families.groom.rsvpWhatsApp`; joint default in `config.rsvpWhatsApp` | Digits only, with country code |
| Functions | `events[]` + a venue `const` per venue | `id` kebab-case; `side` = `bride` / `groom` / `together`; film path in `video` or `videoBySide` |
| Dress code | `events[].dressCode` | Mainly goes into the film; only the colour dot shows in `?host` |
| Photos, videos, song | Sandeep's films → `public/videos/`; song → music `.mp3` in `public/` + `config.bgMusic` | H.264 MP4 ≤ 25 MiB |
| Printed card / colours | `src/styles/tokens.css` palette, fonts in `index.html` | |
| Hindi / Punjabi lines | `families.<side>.ganesha` / `.invocation`, or custom copy | |
| Guest groups | `presets` | Keep the `bride`, `groom` and `all` presets |
| Link preview text | `site.title`, `site.shareTitle`, `site.shareDescription` | Write from the names and date |
| Preview image | `public/og-image.jpg` (1200×630) | Make from a couple photo or the card |
