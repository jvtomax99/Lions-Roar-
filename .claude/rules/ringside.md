---
paths:
  - "ringside.js"
  - "ringside.glb"
---

# Ringside 3D (the fight inside the Find Us map)

- The Find Us map is a drawn canvas map (`#map3d`) with a Street map mode.
  As the map nears the screen, `index.html` loads three.js r147, GLTFLoader
  and SkeletonUtils from `cdn.jsdelivr.net` (`three@0.147.0`), then
  `ringside.js` (exposes `window.LRRing.mount`) and `ringside.glb` (Mixamo
  motion, MakeHuman referee, per its header).
- If any of that fails, a drawn fight stays in its place. Keep that
  fallback working.
- It is skipped under reduced motion and data saver.
- The `examples/js` loaders it uses are not in later three.js releases, so
  a version bump needs a port.
- The fight call-outs have their own Spanish table inside `ringside.js`,
  not in `i18n/es.js`.
