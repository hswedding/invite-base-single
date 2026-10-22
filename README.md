# invite-base-single — one-family wedding invitation base

The base for families who want **their own site**: the bride's family and the
groom's family each get a separate invitation, one repo each, both started
from this base. (For one shared site with bride/groom/joint links, use
[`invite-base`](https://github.com/hswedding/invite-base) instead.)

Each site speaks in one family's voice: `host.side` in `src/data.js`
(`'bride'` or `'groom'`) puts that family's child first, and the invitation
builder has no bride/groom/joint switch. A single-page, mobile-first
digital wedding invitation (React 19 + Vite, GSAP + Lenis, no backend),
hosted free on **Cloudflare Workers static assets**. One site serves **every
guest variant**: which functions each guest sees lives in the link.

It currently carries the bride side of the Hemant & Sukriti invitation
(Malhotra family) as its working example, identical to that wedding's
`?side=bride` page.

## Run it

```bash
npm install
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # production build → dist/
npm run cf:dev     # build + serve dist/ on Cloudflare's local runtime → http://localhost:8787
npm run deploy     # build + deploy with Wrangler (needs `npx wrangler login` once)
```

## Starting a new couple

Full procedure: **[docs/NEW-COUPLE-GUIDE.md](docs/NEW-COUPLE-GUIDE.md)**. The message to send a couple for their details, with where each answer goes: **[docs/CLIENT-INTAKE.md](docs/CLIENT-INTAKE.md)**.

Each family gets its **own repo**, a full clone of this one, so its site can
be customised freely while still being able to pull fixes from the base.
Name them after the couple plus the side:

```bash
./scripts/new-couple.sh aarav-diya-bride   # → hswedding/invite-aarav-diya-bride, host.side: 'bride'
./scripts/new-couple.sh aarav-diya-groom   # → hswedding/invite-aarav-diya-groom, host.side: 'groom'
```

The script clones the base (history kept), renames the remote to `upstream`,
sets the Worker name in `wrangler.jsonc` to `invite-<slug>`, commits, and
pushes a new private repo if the GitHub CLI is logged in (otherwise it prints
the two commands to run). Don't use GitHub's "Use this template" button: a
template copy starts with unrelated history and can never merge base fixes.

### Where a couple's changes go

Keeping to this layout means `git merge upstream/main` only conflicts where
you meant to diverge:

| What | Where |
| --- | --- |
| Names, hosting family (`host`, incl. `host.side`), events, venues, phones, RSVP number | `src/data.js` |
| Page title, description, WhatsApp preview, `noindex`, analytics token | `site` in `src/data.js` |
| Envelope film path, Ganesha image on/off, music | `config` in `src/data.js` |
| Palette, fonts, spacing | `src/styles/tokens.css`, `src/styles/fonts.css` |
| Films, music, preview image (`og-image.jpg`, 1200×630) | `public/` (max 25 MiB per file on Cloudflare) |
| Couple photos (the swipeable reel after the countdown) | `public/photos/` (shrink with `scripts/compress-photos.ps1`) + `photos` in `src/data.js` |
| Decor art | `src/Images/` (swap files, keep names) |
| One-off sections or animations | `src/custom/`, listed in `src/custom/index.js` |

Edit other base files only when the couple's design truly needs it.

### Pulling a base fix into a couple's repo

```bash
git fetch upstream
git merge upstream/main
```

## Hosting on Cloudflare (free)

`wrangler.jsonc` serves `dist/` as static assets and sends unknown paths (the
opaque `/<slug>` guest links) to `index.html`. Requests to static assets are
free and unlimited.

Films and music (`/videos/*`, `*.mp4`, `*.mp3`) go through a tiny Worker,
`worker/index.js`, that answers HTTP Range requests with `206 Partial
Content`. Cloudflare's asset server returns whole files to Range requests,
and Safari on iPhone/Mac won't play video served that way. The Worker needs
each file's size, which the build writes to `worker/media-sizes.json`
(generated, git-ignored), so always deploy via `npm run build` first. These
media requests count towards the free plan's 100,000 Worker requests a day.

One-time per repo, in the Cloudflare dashboard:

1. **Workers & Pages → Create → Import a repository** → pick the repo.
2. Build command `npm run build`, deploy command `npx wrangler deploy`
   (both are detected automatically).
3. The Worker name must match `name` in `wrangler.jsonc`. The site goes live
   at `https://<name>.<your-subdomain>.workers.dev`.
4. Optional: **Settings → Domains & Routes** to add the couple's own domain.

Every push to `main` redeploys. Pushes to other branches get a stable preview
URL, handy for sending a couple a draft.

**Analytics (optional):** dashboard → Web Analytics → add a site → copy the
token from the snippet into `site.cloudflareAnalyticsToken` in `src/data.js`.

## Sending different guests different functions

Open the **host control panel** at `https://your-site/?host`. Pick the
guest's functions (checkboxes or a quick preset), optional sections and an
optional guest name. The page previews live, and you get a
**shareable link** + a **Share on WhatsApp** button.

The shareable link is an opaque token — `https://your-site/c2lkZT1icmlkZQ` —
which is just the query string below, base64url-encoded into the path (no
backend or storage; the link *is* the config). Append `?host` to any such link
to reopen the builder on that variant. Unrecognisable tokens fall back to the
full invitation (every function).

> The `?host` panel is hidden, not secured — anyone with the URL (or who edits
> the query string) can change the view. That's fine for a wedding invite; don't
> put anything private behind it.

### The link format (you rarely need this — the panel builds it)

| Param | Meaning | Example |
|---|---|---|
| `preset` | a named set | `?preset=shagun-wedding` |
| `fns` | exact functions (ids from `data.js`) | `?fns=haldi,wedding` |
| `to` | personalised greeting | `?to=Sharma%20Family` |
| `countdown` `photos` `venue` `rsvp` | set to `0` to hide | `?photos=0` |

A bare URL with no params = every function, everything on. A `side` param
from an old link is ignored. Presets are the named guest groups in
`presets` (`all` plus the family's own).
