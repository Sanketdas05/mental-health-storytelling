export function addHandsScene(timeline) {
  return timeline
    .addLabel('hands-enter')
    // Fade in hands scene
    .to('.hands-scene', { autoAlpha: 1, duration: 0.6, ease: 'power2.out' })

    // Interactive reaching hands illustration appears
    .fromTo('.interactive-hands-wrap',
      { autoAlpha: 0, scale: 0.95 },
      { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
      '<0.1'
    )

    // Supportive story header fades in
    .fromTo('.hands-story-header',
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '<0.2'
    )

    // Drag control slider fades in
    .fromTo('.hands-drag-control',
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '<0.2'
    )

    // Timeline hold for user exploration
    .to({}, { duration: 4.0 });
}
