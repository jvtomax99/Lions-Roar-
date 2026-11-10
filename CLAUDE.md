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

# General rules (all of Jose's website projects)

These are the same in every project. Where this project works differently
(hosting, file names, who the real user is), the "This project" section above
says so, and it wins.

## Planning and working with me

**Challenge me.** Question my ideas. Don't sugarcoat problems. If a plan is bad, say so and why, then give me a better option. Point out the biggest risk I'm not seeing. Don't argue over small stuff, and once I've decided after hearing you out, build it my way.

**Spec.** Every project has a SPEC.md in the repo root with:
- What it does and who it's for. If the real user isn't me, say who it is and what they need.
- A "Done when" line or two for each feature (example: "A user can finish a practice quiz and see their score").
- A "Not in v1" list of things we're deliberately not building yet.
- A "Later" list for ideas we're saving.

New project with no SPEC.md: help me write it before any code.
Existing project with no SPEC.md: write one from the current code, then ask me to fill the gaps and the "Not in v1" list.
Keep SPEC.md updated when decisions change. If I ask for something on the "Not in v1" list or not in the spec, point it out and ask whether to add it now or move it to "Later."

**Phases.** SPEC.md has a "Phases" section: the build order, each phase as a short list of features with a checkbox. Each phase should fit in one or two sessions. When a phase is done and verified, check it off.

**Cleanup check.** After a phase is checked off, look at the "Last audit" line at the top of docs/CLEANUP.md. If 3 phases have been completed since then, or it's been more than 30 days, or the file doesn't exist yet, offer to run the cleanup audit in docs/cleanup-audit.md, with buttons: "Run it now" (recommended), "Next session," or "Skip this time." If docs/cleanup-audit.md doesn't exist, ask me to paste my cleanup audit prompt and save it there first.

**Architecture doc.** Keep docs/ARCHITECTURE.md short and current: the main folders, the key files and what each does, and how data moves through the app. Read it at the start of a session instead of exploring the code. Update it whenever the structure changes.

**Big vs small.** A big feature adds a new page or screen, stores new kinds of data, or connects to an outside service. Everything else is a small change.

**Research before big features.** For a new project or a big feature, look at 2 or 3 similar tools or sites first. Tell me in a few lines how they do it and where mine can be better. New ideas from research go into "Later" unless I approve them for now. Skip this for small changes.

**Explain it back.** Before coding a new project or big feature, use plan mode. Explain in plain words what you'll build and how it works, then list your assumptions separately (example: "progress saves across devices"). Wait for my OK. If I correct you, update SPEC.md.
If I'm not around to approve, like in a scheduled or background run, don't start big features. Do small changes only and leave me the plan to review.
If the real user isn't me, remind me to check the plan with them before building.

**Show me it works.** I can't read code well enough to check it, so every feature ends with proof I can see. Never say "fixed," "works," or "done" without actually running or testing it, and say what you checked. If you couldn't check it, say "not verified" and why.
- Small changes: a screenshot or a short "try this" list of steps.
- Big features: check against the "Done when" line, put up a preview I can open on my phone (see "This project" for what a preview is here), and give me the link.

**Review before the pull request.** When a phase or big feature is done, have a separate reviewer subagent check the changes before opening the pull request. It looks for bugs, broken behavior, and anything that doesn't match SPEC.md, without seeing how the code was written. Fix what it finds, then tell me in two or three lines what it caught.

**Status updates.** When reporting progress or what you did, be extremely concise: short fragments are fine. This is for updates only; explanations stay in plain, full sentences.

**Help me learn.** After a meaningful change, explain in 2 or 3 plain sentences what you changed and why.

**Ask before anything risky.** Explain it and get my OK before you:
- Delete data or files I may need.
- Change how logins or accounts work.
- Push to the main branch.
- Deploy to the live site.
- Do anything that costs money.

## Usage

**Keep the session light.** Every step re-sends the whole session, so a heavy session burns usage on everything after it. Prevent bloat first:
- Read only the parts of files you need, not whole files.
- Don't paste full logs or test output. Show me only the lines that matter.
- For big searches or reading many files, use a subagent so only its summary lands in this session.

**Helpers.** Use Haiku subagents for repetitive work (searching, reading test results, summaries, checking lists). Keep planning, decisions, and code changes on the main model, and check the helpers' results before relying on them.

**When to start a new session.** A new session costs about 20k to 40k tokens to get back up to speed, so only switch when it saves more than that. Triggers (token count or share of the context window, whichever comes first):
- Under 150k or 50%: keep going.
- 150k to 300k or 50% to 75%: finish the current step, then hand off.
- Over 300k or 75%: hand off now, even mid-task.
- Next task is unrelated and the session is over 100k: hand off.
- I tell you I've been away more than an hour and the session is over 100k: hand off.

When a trigger hits, ask me once with buttons: "Start a new session" (recommended) and "Keep going." If I say keep going, don't ask again until the next trigger.
Auto-compact is off, so a full session just stops and leaves no room for a handoff. If I say keep going past 75%, warn me once, and write HANDOFF.md anyway so it's ready.

**Handoffs.** Write HANDOFF.md in the repo root, short and pointing to what already exists:
- The goal and the exact next step.
- What's done (point to commits) and what's left.
- Decisions made this session that aren't in SPEC.md yet. Add them to SPEC.md too.
- Files I'll need to look at first.

Overwrite it each time. In a cloud session, commit and push it on the current branch so the next session can see it.
At the start of a session, if HANDOFF.md exists, read it first and confirm the next step with me.
When the work it describes is done (phase checked off, pull request opened), delete HANDOFF.md so the next session doesn't follow stale instructions.

**Effort.** Don't use ultracode or max effort unless I ask.

**Keep CLAUDE.md lean.** When we make a decision that should last, suggest a one-line addition to CLAUDE.md. Remove lines that no longer apply. Keep it short, since it loads every session.

## Environment and installs

**Saving settings.** When something needs to be saved outside this session, like an API key, password, environment variable, or setup step, give it to me as one copy-and-paste block. Tell me in one line exactly where to paste it. Use the format that place expects. If it's a secret only I have, write YOUR_VALUE_HERE instead of the real value. Never put secrets in code files or commit them to the repo.

**Installing tools.** Ask me first, with clickable buttons, before installing anything that changes my computer, costs money, needs an account, or connects to my apps (plugins, MCP servers, connectors, system programs). Tell me what it is and why it helps, put your recommended choice first, and include a Skip option. If I say yes, install it yourself and check that it works. Don't ask about things already installed. If you can't ask me, like in a scheduled or background run, skip the install and tell me what you skipped and why.

**Project packages.** Normal packages this project needs, install without asking and mention them. Always add them to the project's package list (package.json, requirements.txt, or whatever this project uses) so one install command brings everything back.

**Making installs stick.** Cloud sessions erase installs when they end. My environment's setup script should run the project's install command (like npm install). For system tools that live outside the project, give me the copy-and-paste line to add to the setup script so they install automatically next time.

## Git and GitHub

**Branches.** Never commit directly to main. For each feature or fix, make a new branch with a plain name (like add-quiz-scores or fix-login-button). Before starting, pull the latest main and check for uncommitted work so nothing gets overwritten. (A cloud session that was handed a branch name uses that branch.)

**Commits.** Commit in small steps, each with a plain-English message that says what changed (like "Add score screen after practice quiz"). Never commit secrets, API keys, or .env files. Make sure they're in .gitignore.

**Pushing.** Pushing a feature branch is fine without asking (previews need it, where the project has them).
Getting work into main always needs my OK:
1. Open a pull request with a short plain summary, the "Done when" check from SPEC.md, and the preview link (or the screenshots, where the project has no previews).
2. Send me a phone notification saying which change it is and that it needs my "push." If you can't send a notification, put that at the very top of your message instead.
3. Wait for my OK before merging.

**Never without asking:**
- Force push.
- Delete branches that have work not yet in main.
- Rewrite or reset history (git reset --hard, rebase on main, and similar).
- Change repo settings, like making a repo public.

If I ask you to do one of these, explain what it will do and what can't be undone first.

**Big files.** GitHub rejects files over 100 MB. If an asset is that big, warn me before committing and suggest compressing it or using Git LFS.

**Undo.** When you merge something, tell me in one line how to undo it if it breaks the live site.

## Assets

Before any asset work (3D models, textures, icons, fonts, images, sounds, templates), read docs/assets.md and follow it. If docs/assets.md doesn't exist yet, stop and ask me to paste my asset rules, then create it before starting.

## Design

Before building or changing any page or UI, read docs/design-rules.md and DESIGN.md and follow them. If docs/design-rules.md doesn't exist yet, stop and ask me to paste my design rules, then create it before starting.
