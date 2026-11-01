# I'm fine

A scroll-controlled React + GSAP story about the emotions people may carry without showing them. It uses plain JavaScript, not TypeScript.

## Run it

```bash
npm run dev
```

## Structure

- `src/components/` — self-contained story scenes and shared UI
- `src/animations/scenes/` — one focused GSAP timeline module per story beat
- `src/animations/motion.js` — GSAP registration, motion preference handling, and React-safe animation contexts
- `src/hooks/useLenis.js` — smooth scrolling synchronized with ScrollTrigger
- `src/components/AtmosphereBackground.jsx` — original, layered background motion built from the supplied abstract image
- `src/config/story.js` — chapter and palette source of truth for future scene work
- `src/styles/global.css` — visual language and responsive scene styling

## Adding a chapter

Create a scene component, position it inside `App.jsx`, then add a matching module under `animations/scenes/` and compose it into the `film` timeline. Scenes currently cover the opening portrait, the living room / TV zoom, and the message / inner-thought reveal.

Future chapters are intentionally left as additions: anxiety illustration and ASCII interaction, emotional loop, reaching hands, the dark-to-light shift, sound toggle, and support-resources footer.

## Motion and access

Scroll-led animation automatically respects `prefers-reduced-motion`: the scenes become an ordinary vertical sequence, avoiding pinned or scrubbed movement.
