export function addAnxietyScene(timeline) {
  return timeline
    .addLabel('anxiety-enter')
    // Ensure #anx & #wall are fully visible immediately (zero downtime, seamless continuation)
    .to('#anx', { autoAlpha: 1, duration: 0.25 })
    .to('#wall', { opacity: 1, duration: 0.25 }, '<')

    // Caption fades in as the ASCII face emerges
    .to('#cap', { opacity: 1, duration: 0.45, ease: 'power2.out' }, '<0.1')

    // Extended timeline hold so the user experiences the full multi-stage progression:
    // 1. Character lives, breathes, and flinches as thoughts land
    // 2. Ink-like erosion spreads from landing seeds
    // 3. Swirling transport as glyphs multiply and flow into looming heads
    // 4. Heads hold, eyes close, and drift down as falling glyphs
    .to({}, { duration: 8.5 })

    .addLabel('anxiety-exit')
    // Dissolve text and canvas content out toward the hands scene while preserving atmospheric background
    .to('#cap', { opacity: 0, duration: 0.4, ease: 'power2.in' })
    .to('#wall', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '<0.1');
}
