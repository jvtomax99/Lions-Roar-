# Architecture

A static one-page site on GitHub Pages. No build step, no server, no
database, no package manager. The browser loads the files as they are.

## Files

- `index.html`: the whole page. Markup, then one `<style>`, then one
  `<script>` near the end. Sections by id, top to bottom: `top` (hero, nav,
  lion), `kru`, `film`, `champions`, `reviews`, `matthew`, `classes`,
  `hours`, `find`, `join`, footer. The phone menu (`#drawer`) sits above
  the hero.
- `ringside.js`: the 3D fight inside the Find Us map. Defines
  `window.LRRing.mount(box, options)`, which the map calls.
- `ringside.glb`: 3D fighters, referee and their motion, read by
  `ringside.js`.
- `i18n/es.js`: Spanish text as `window.LR_ES`, keyed by the exact English.
- `img/`: photos, crest, lion mascot, icons, share image.
- `video/`: for each reel or class, a full `.mp4`, a short `-loop.mp4`
  (reels only) and a `.webp` poster.
- `manifest.webmanifest`: name, colors, icons.

## Outside services (all loaded by the browser)

- Google Fonts: Anton, Barlow Condensed, Barlow, Teko.
- cdn.jsdelivr.net: three.js r147, GLTFLoader, SkeletonUtils (only when
  the map nears the screen).
- YouTube (`youtube-nocookie.com`): the Wai Kru video, only after a tap.
- Links out only: Google Maps, Apple Maps, Instagram, phone, SMS, email.

## How things move through the page

1. The page paints from `index.html` alone, in English.
2. Scroll effects, the sticky book button and video loops start when their
   section comes into view (IntersectionObserver). Reduced motion or data
   saver (the `calm` flag) turns motion off, video loops and Ringside too.
3. EN | ES: tapping ES loads `i18n/es.js` once, swaps matching text and
   labels in place, and keeps watching for text the page adds later. The
   choice is saved in `localStorage` key `lr-lang`. EN puts the English back.
4. Find us: the map is drawn on a canvas (`#map3d`). About 900 px before it
   scrolls into view, the page loads three.js, then `ringside.js`, then
   `ringside.glb`. The map drives the camera; the 3D fight fades in as the
   camera reaches the ring. If loading fails, a drawn fight stays instead.
5. Join: every action is a plain link (`tel:`, `sms:`, `mailto:`, maps).
   Nothing is sent to a server. No forms.

## Stored on the visitor's phone

- `localStorage` `lr-lang`: `en` or `es`. Nothing else.
