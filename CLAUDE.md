# CLAUDE.md: Lion's Roar Muay Thai

A one-page website for Lion's Roar Muay Thai, a Bronx gym run by Kru William
"Willie" Rivera since 1990, in English with a Spanish switch (EN | ES). Live
at https://jvtomax99.github.io/Lions-Roar-/ (the path is case-sensitive).
Plain files on GitHub Pages: no build step, no packages, no tests.

Read first: `SPEC.md` (what, who, phases) and `docs/ARCHITECTURE.md` (map of
files and how the page works). The rules shared by all of Jose's projects
are in `.claude/rules/general.md`; where this file differs, this file wins.

## Rules for this repo

- **Real users:** Kru William and people thinking of joining, often on a
  phone. Before a big feature, remind Jose to check the plan with Kru
  William. Prices, hours, schedule and contact details come from the gym,
  never guessed.
- **Spanish follows the English text exactly.** The ES switch swaps any
  text whose English matches a key in `i18n/es.js` (spaces collapsed; also
  split on " · ", ", " and " – "), plus `aria-label`, `alt`, `data-cap`,
  `data-card` and `title`. Change English copy and you must change its key
  in `es.js` too, or that line stays English. Reviews and quotes
  (`.quote blockquote`, `.kf-quote p`) stay as said, on purpose. Check the
  page in both EN and ES.
- **Relative paths only.** The site lives in the `/Lions-Roar-/` subfolder,
  so a link or `src` starting with `/` breaks on Pages.
- **Contact facts repeat.** The phone number is in `index.html` 14 times
  (links, text, JSON-LD), the email 4 times, the address in the map, Find
  Us, Join, footer and JSON-LD. Change them all together.
- **Cache-busting.** Some images carry `?v=`. When replacing one of those
  files, bump its `?v=` or phones keep the old one.
- **Motion.** Anything new that moves or autoplays must respect
  `prefers-reduced-motion` in CSS and the script's `calm` flag (reduced
  motion or data saver).
- **Ringside 3D** (`ringside.js`, `ringside.glb`, and the loader in
  `index.html`): read `.claude/rules/ringside.md` before changing it.
- **Unused files, ask Jose before deleting:** `img/kru-hero.svg`,
  `img/kru-hero-extended.svg`, `img/kru-hero-crest.svg`,
  `img/kru-hero-crest-extended.svg`, `img/lion-anim.webp`,
  `img/tkd-class.webp` (checked 2026-11-10).
- **Public repo.** Paid raw files (fonts, models) can't be committed
  (`docs/assets.md`, section 9). Before any purchase ask Jose: free assets,
  or GitHub Pro or a move to Vercel so the repo can go private.

## Preview and going live

- **Preview.** There are no branch previews, and whatever lands on the
  Pages branch (most likely `main`; not checked in the repo settings) is
  live a minute or two later. Serve the repo from its parent folder so the
  URL includes `/Lions-Roar-/`, and send Playwright screenshots at 390 px
  and 1440 px plus a short "try this" list. The pull request carries the
  screenshots.
- **Site check.** `node .github/site-check.cjs` with the pages listed in
  `.github/workflows/site-check.yml`; it also runs on every pull request and
  must be green before asking Jose to push. A new page goes into that list.
- **Not made yet:** `DESIGN.md` and `docs/CLEANUP.md`. Make them when a rule
  first needs one (`docs/design-rules.md` says how).

## Tools

- **Taste skill** (`.claude/skills/taste/`): it asks for the Playwright MCP
  server. In a cloud session use the installed Playwright instead and run
  its `references/extract.js` with `page.evaluate`.
- **Refactor.** `docs/refactor.md`, run when Jose asks for "Refactor:
  CLEANUP.md items ...".
