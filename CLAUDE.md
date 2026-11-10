# CLAUDE.md: Lion's Roar Muay Thai

## What this is

A one-page website for Lion's Roar Muay Thai, a martial arts gym in the
Bronx run by Kru William "Willie" Rivera since 1990. Muay Thai, Boxing,
Tae Kwon Do and Jiu-Jitsu, for kids, teens and adults. The site is in
English with a Spanish switch (EN | ES).

- **Live:** https://jvtomax99.github.io/Lions-Roar-/ (the canonical link in
  `index.html`). The path is case-sensitive.
- **Repo:** `jvtomax99/Lions-Roar-`
- **Hosting:** GitHub Pages, straight from the repo files. No build step, no
  package manager, no tests. There is no workflow file in the repo, so Pages
  serves a branch as it is (most likely `main`; not checked in the repo
  settings). Whatever lands on that branch is live a minute or two later.
- **Real users:** the gym owner (Kru William) and people thinking of
  joining, often on a phone. Jose builds it; he is not the end user.

## File layout

Sizes from `ls -la` and `wc -l` on 2026-11-10. Re-measure before quoting.

| Path | Size | What |
|---|---|---|
| `index.html` | 2,579 lines, 263 KB | The whole site: markup, CSS and JS inline. Sections by id: `top` (hero, nav, lion mascot), `kru`, `film`, `champions`, `reviews`, `matthew`, `classes`, `hours` (price and weekly schedule), `find` (3D map), `join`, then footer |
| `ringside.js` | 630 lines, 68 KB | The 3D fight inside the Find Us map. Loaded on demand (see gotchas). Exposes `window.LRRing.mount` |
| `ringside.glb` | 2.8 MB | The 3D fighters and referee for `ringside.js` (Mixamo motion, MakeHuman referee, per its header) |
| `i18n/es.js` | 276 lines, 21 KB | Spanish text, `window.LR_ES`: English text as key, Spanish as value |
| `img/` | 33 files, 6.0 MB | Photos, crest, lion mascot (`lion-anim.gif`, `lion-still.webp`), icons, share image |
| `video/` | 25 files, 34 MB | Class clips (`class-*.mp4`), fight film reels: full `.mp4`, a short `-loop.mp4` and a `.webp` poster each |
| `manifest.webmanifest` | 14 lines | Name, colors, icons (`display: browser`) |

Biggest files: `video/rumble-in-the-bronx.mp4` 10.5 MB, `video/pad-day.mp4`
6.0 MB, `video/muay-thai-madness-14.mp4` 5.1 MB. All far under GitHub's
100 MB limit. Whole working tree: 44 MB.

## Project gotchas

- **Relative paths only.** The site lives in the `/Lions-Roar-/` subfolder,
  so a link or `src` starting with `/` breaks on Pages. None exist today.
- **Spanish follows the English text exactly.** The ES switch walks the page
  and swaps any text whose English matches a key in `i18n/es.js` (spaces
  collapsed; also split on " · ", ", " and " – "). It also translates
  `aria-label`, `alt`, `data-cap`, `data-card` and `title`. Change English
  copy on the page and you must change its key in `es.js` too, or that line
  stays English. Reviews and quotes (`.quote blockquote`, `.kf-quote p`)
  are left as said, on purpose. `es.js` loads only when ES is picked; the
  choice is saved in `localStorage` key `lr-lang`.
- **Ringside 3D.** The Find Us map is a drawn canvas map (`#map3d`) with a
  Street map mode. As the map nears the screen, it loads three.js r147,
  GLTFLoader and SkeletonUtils from `cdn.jsdelivr.net` (`three@0.147.0`),
  then `ringside.js` and `ringside.glb`. If any of that fails, a drawn fight
  stays in its place. Skipped under reduced motion and data saver. The `examples/js`
  loaders it uses are not in later three.js releases, so a version bump
  needs a port. The fight call-outs have their own Spanish table inside
  `ringside.js`, not in `es.js`.
- **Reduced motion and data saver.** The CSS has `prefers-reduced-motion`
  guards, and the main script's `calm` flag is true under reduced motion or
  `navigator.connection.saveData`; it stops reel and class video loops, the
  map's motion and Ringside. Keep these checks on anything new that moves
  or autoplays.
- **Cache-busting.** Some images carry `?v=` (`?v=5`, `?v=furious2`,
  `?v=furious3`, `?v=b`). When replacing one of those files, bump its `?v=`
  or phones keep the old one.
- **Contact facts repeat.** The phone number appears 14 times in
  `index.html` (links, text, JSON-LD), the email 4 times, the address in the
  map, Find Us, Join, footer and JSON-LD. Change them all together.
  Membership price: `$250 / month`, in the Hours section.
- **YouTube** loads only on tap (`youtube-nocookie.com` embed over a
  thumbnail).
- **Unused files.** Not referenced by any page or script on 2026-11-10:
  `img/kru-hero.svg`, `img/kru-hero-extended.svg`, `img/kru-hero-crest.svg`,
  `img/kru-hero-crest-extended.svg`, `img/lion-anim.webp`,
  `img/tkd-class.webp`. Ask Jose before deleting.
- **Fonts:** Anton, Barlow Condensed, Barlow and Teko from Google Fonts.
  Colors are CSS variables at the top of the `<style>` (black, cream,
  yellow).

## This project: how the general rules apply here

- **Hosting and previews:** GitHub Pages has no branch previews. Getting a
  change into the Pages branch is going live. So the "preview" here is
  Playwright screenshots at phone width (390 px) and desktop (1440 px),
  plus a short "try this" list. Serve the repo from its parent folder so the
  URL includes `/Lions-Roar-/`, like the live site. The pull request carries
  the screenshots instead of a preview link.
- **Who checks the plan:** the real users are Kru William and new students.
  Before a big feature, remind Jose to check the plan with Kru William.
  Prices, hours, schedule and contact details come from the gym, never
  guessed.
- **Spanish:** any visible text change also updates `i18n/es.js` (see
  gotchas). Check the page in both EN and ES.
- **Plan and phases:** `SPEC.md` in the repo root, section "Phases".
  Structure and data flow: `docs/ARCHITECTURE.md`.
- **Handoffs:** new handoffs go in root `HANDOFF.md`. None exists yet, and
  there are no older notes files in this repo.
- **Branches:** past work (50 commits up to 2026-10-03) went straight to
  `main`. From now on, a branch per change, as the general rules say.
- **Rule docs:** `docs/design-rules.md`, `docs/assets.md`,
  `docs/cleanup-audit.md` and `docs/refactor.md` are in the repo.
  `DESIGN.md` and `docs/CLEANUP.md` do not exist yet; make them when a rule
  first needs one (`docs/design-rules.md` says how).
- **Older rules kept until Jose decides:** none. This repo had no
  CLAUDE.md before 2026-11-10.

- **Public repo, paid assets.** The repo is public (checked 2026-11-10) and GitHub Pages on a free plan needs it public, so paid raw files (fonts, models) can't be committed here (docs/assets.md, section 9). Before any purchase, ask Jose: keep to free assets, or GitHub Pro / a move to Vercel so the repo can go private.
- **Taste skill.** Saved in `.claude/skills/taste/` (Senlin's, MIT; `SOURCE.md` there says where from). It asks for the Playwright MCP server; in a cloud session use the Playwright already installed instead (run its `references/extract.js` with `page.evaluate`).
- **Refactor prompt.** docs/refactor.md, run when Jose asks for "Refactor: CLEANUP.md items ...".
- **Site check.** Every pull request runs `.github/site-check.cjs` on GitHub ("Site check": missing files, links starting with "/", script errors at phone and desktop width). It must be green before asking Jose to push. Run it locally with `node .github/site-check.cjs` and the pages listed in `.github/workflows/site-check.yml`. A new page goes into that list.

# General rules (all of Jose's website projects)

Same in every project. Where the "This project" section above differs, it wins.

## Planning

- **Challenge me.** Question my ideas; no sugarcoating. Say plainly when a plan is bad, why, and what's better; name the biggest risk I'm missing. Skip small stuff. Once I've decided after hearing you out, build it my way.
- **SPEC.md** (repo root): what it does and who for (if not me, who and what they need); one or two "Done when" lines per feature; "Not in v1"; "Later"; "Phases" (build order, a checkbox list per phase, each phase one or two sessions; check it off when done and verified). New project: write it with me before any code. Existing project without one: draft it from the code, then ask me to fill the gaps and "Not in v1". Keep it current. If I ask for something not in it or on "Not in v1", say so and ask: now, or "Later"?
- **Cleanup check.** After a phase is checked off, read "Last audit" at the top of docs/CLEANUP.md. If 3 phases have been completed since then, or it's been over 30 days, or the file is missing, offer docs/cleanup-audit.md with buttons: "Run it now" (recommended), "Next session", "Skip this time". If cleanup-audit.md is missing, ask me for the prompt and save it there.
- **docs/ARCHITECTURE.md**: short and current (main folders, key files, how data moves). Read it at session start instead of exploring; update it when the structure changes.
- **Big feature** = a new page or screen, a new kind of stored data, or a new outside service. Everything else is small.
- **Big features and new projects:** first look at 2 or 3 similar tools and tell me in a few lines how they do it and where mine can be better (new ideas go to "Later" unless I approve). Before any coding, use plan mode: what you'll build and how, in plain words, with assumptions listed separately; wait for my OK. Whenever I correct you, update SPEC.md. In a scheduled or background run, do small changes only and leave the plan. If the real user isn't me, remind me to check the plan with them.

## Proof and reporting

- **Show me it works.** I can't check code, so every feature ends with proof I can see. Never say "fixed", "works" or "done" without running or testing it; say what you checked, or "not verified" and why. Small change: a screenshot or a short "try this" list. Big feature: check its "Done when" line and give me the link to a preview I can open on my phone (what a preview is here: "This project").
- **Review before the pull request.** After a phase or big feature, and before opening its pull request, a separate reviewer subagent checks the changes for bugs, broken behavior and mismatches with SPEC.md, without seeing how the code was written. Fix what it finds; tell me in 2 or 3 lines what it caught.
- **Reports:** status updates extremely concise, fragments fine. Explanations in plain full sentences. After a meaningful change, 2 or 3 plain sentences on what changed and why.
- **Ask first** before: deleting data or files I may need, changing logins or accounts, pushing to main, deploying to the live site, anything that costs money.

## Usage

- **Keep the session light.** Read only the parts of files you need. Show me only the lines of logs and test output that matter. Big searches and many-file reads go to a subagent so only its summary comes back.
- **Helpers.** Haiku subagents for repetitive work (searching, test results, summaries, checklists). Planning, decisions and code changes stay on the main model; check helpers' results before relying on them.
- **New session triggers** (tokens or share of context, whichever first; a new session costs 20k to 40k to catch up): under 150k or 50%, keep going. 150k to 300k or 50% to 75%, finish the step, then hand off. Over 300k or 75%, hand off now, even mid-task. Over 100k and the next task is unrelated: hand off. Over 100k and I tell you I've been away over an hour: hand off. Ask once with buttons, "Start a new session" (recommended) and "Keep going"; if I keep going, don't ask again until the next trigger. If I say keep going past 75%, warn me once and write HANDOFF.md anyway (auto-compact is off, so a full session just stops).
- **HANDOFF.md** (repo root, short, pointing to what exists): the goal and exact next step; what's done (commits) and what's left; this session's decisions (also added to SPEC.md); files to look at first. Overwrite it each time; in a cloud session commit and push it on the current branch. At session start, if it exists, read it first and confirm the next step with me. Delete it once its work is done (phase checked off, pull request opened).
- **Effort.** No ultracode or max effort unless I ask.
- **Keep CLAUDE.md lean.** Suggest a one-line addition for a lasting decision; remove lines that no longer apply. Keep it short: it loads every session.

## Environment and installs

- **Settings to save** (API key, environment variable, setup step): one copy-and-paste block in the format that place expects, plus one line saying exactly where to paste it. Secrets I hold: YOUR_VALUE_HERE. Never put secrets in code or commit them.
- **Ask first, with buttons** (recommended first, plus Skip), before installing anything that changes my computer, costs money, needs an account or connects to my apps (plugins, MCP servers, connectors, system programs). Say what it is and why it helps. On yes, install it yourself and check it works. Don't ask about what's installed already. In a scheduled or background run, skip it and tell me what you skipped and why.
- **Project packages:** install without asking, mention them, and add them to the package list (package.json, requirements.txt) so one command restores everything.
- **Making installs stick:** the environment's setup script runs the project's install command; for system tools outside the project, give me the copy-and-paste line to add to it.

## Git and GitHub

- **Branches.** Never commit to main. One branch per feature or fix with a plain name (add-quiz-scores). Pull the latest main and check for uncommitted work first. (A cloud session handed a branch name uses it.)
- **Commits.** Small steps, plain-English messages ("Add score screen after practice quiz"). Never commit secrets, keys or .env files; keep them in .gitignore.
- **Pushing.** A feature branch: push freely. Into main: (1) a pull request with a short plain summary, the "Done when" check and the preview link (or screenshots where there are no previews); (2) a phone notification naming the change and saying it needs my "push" (if you can't notify, put that at the very top of your message); (3) wait for my OK before merging.
- **Never without asking** (if I ask for one, first explain what it will do and what can't be undone): force push; deleting a branch with work not in main; rewriting or resetting history (git reset --hard, rebase on main); changing repo settings (like making a repo public).
- **Big files.** GitHub rejects files over 100 MB: warn me before committing one and suggest compressing it or Git LFS.
- **Undo.** After a merge, one line on how to undo it if it breaks the live site.

## Assets and design

- **Assets** (models, textures, icons, fonts, images, sounds, templates): read docs/assets.md first and follow it. If it's missing, stop, ask me to paste my asset rules, and create it before starting.
- **Design** (any page or UI): read docs/design-rules.md and DESIGN.md first and follow them. If design-rules.md is missing, stop, ask me to paste my design rules, and create it before starting.
