export function addIntroScene(timeline) {
  return timeline
    // ── 1. CRT content fades / slides out from fully visible state ──────
    .fromTo('.crt-title-wrap',
      { autoAlpha: 1, y: 0 },
      { autoAlpha: 0, y: -16, duration: 0.35 }
    )
    .fromTo('.crt-eyebrow, .crt-deck, .scroll-cue',
      { autoAlpha: 1, y: 0 },
      { autoAlpha: 0, y: -22, duration: 0.35 },
      '<0.05'
    )

    // ── 2. Grain + tear layers fade ────────────────────────────────────────
    .fromTo('.crt-grain-canvas, .crt-tear-canvas',
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: 0.30 },
      '<0.08'
    )

    // ── 3. Camera zooms toward the screen centre — CRT becomes the portal ──
    .fromTo('.crt-bezel',
      { scale: 1, transformOrigin: '50% 48%' },
      { scale: 5.5, duration: 1.15, ease: 'power1.inOut' },
      '<0.05'
    )

    // Scanlines & vignette dissolve as we "enter" the display
    .fromTo('.crt-scanlines, .crt-vignette, .crt-curvature, .crt-phosphor',
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: 0.65, ease: 'power1.out' },
      '<0.35'
    )

    // ── 4. Dark, restrained CRT-style dissolve: screen dimming ──
    .fromTo('.crt-screen-inner',
      { opacity: 1, filter: 'brightness(1)' },
      { opacity: 0.15, filter: 'brightness(0.35)', duration: 0.5, ease: 'power1.inOut' },
      '<0.2'
    )

    // ── 5. Entire intro fades away into darkness, smoothly handing off to interlude ──
    .fromTo('.crt-intro',
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: 0.6, ease: 'power1.inOut' },
      '<0.2'
    )
}
