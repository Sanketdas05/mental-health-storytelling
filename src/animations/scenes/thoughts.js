export function addThoughtsScene(timeline) {
  const proxy = { p: 0, staticAmp: 1.0 };

  return timeline
    .addLabel('phone-enter')
    // ── 1. Enter Phase 3 Phone Scene (smooth match-cut from workstation) ──
    .fromTo('#phoneScene', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: 'power1.inOut' })
    .fromTo('#ph',
      { scale: 0.90, opacity: 0, y: 16 },
      { scale: 1.0, opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
      '<'
    )

    // Before any message: static only, with character glimpsed intermittently
    .to({}, { duration: 0.6 })

    // Static amplitude eases from 1.0 down to ~0.2 as connection resolves
    .to(proxy, {
      p: 0.08,
      staticAmp: 0.2,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        window.__setPhase3Progress?.(proxy.p);
        window.__setPhoneStaticAmp?.(proxy.staticAmp);
      }
    })

    // ── 2. Message 1 (Incoming): "hey… you okay?" ────────────────────────────
    .call(() => {
      window.__triggerPhoneTearFlash?.();
      const lbl = document.getElementById('phoneStatusLabel');
      if (lbl) lbl.innerHTML = 'INCOMING<span class="phone-dots">.</span>';
    })
    .to('#m1', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.15')
    .to(proxy, { p: 0.16, duration: 0.7, onUpdate: () => window.__setPhase3Progress?.(proxy.p) })

    // ── 3. Pause with typing indicator "…" ───────────────────────────────────
    .to('#mTyping', { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' })
    .to(proxy, { p: 0.22, duration: 0.6, onUpdate: () => window.__setPhase3Progress?.(proxy.p) })
    .to('#mTyping', { opacity: 0, duration: 0.15 })

    // ── 4. Reply (Send): "I'm fine :)" ───────────────────────────────────────
    .call(() => {
      window.__triggerPhoneTearFlash?.();
      const lbl = document.getElementById('phoneStatusLabel');
      if (lbl) lbl.innerHTML = 'TX: SENT';
    })
    .to('#m2', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.08')
    .to(proxy, { p: 0.28, duration: 0.7, onUpdate: () => window.__setPhase3Progress?.(proxy.p) })

    // ── 5. Message 3 (Incoming): "you sure?" ─────────────────────────────────
    .call(() => {
      window.__triggerPhoneTearFlash?.();
      const lbl = document.getElementById('phoneStatusLabel');
      if (lbl) lbl.innerHTML = 'INCOMING<span class="phone-dots">..</span>';
    })
    .to('#m3', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.15')
    .to(proxy, { p: 0.34, duration: 0.7, onUpdate: () => window.__setPhase3Progress?.(proxy.p) })

    // ── 6. Message 4 (Reply): "yeah. all good :)" ────────────────────────────
    .call(() => {
      window.__triggerPhoneTearFlash?.();
      const lbl = document.getElementById('phoneStatusLabel');
      if (lbl) lbl.innerHTML = 'TX: SENT';
    })
    .to('#m4', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.08')

    // Settle phone into faint static
    .to(proxy, {
      p: 0.40,
      staticAmp: 0.05,
      duration: 0.8,
      ease: 'power1.out',
      onUpdate: () => {
        window.__setPhase3Progress?.(proxy.p);
        window.__setPhoneStaticAmp?.(proxy.staticAmp);
      }
    })

    // ── 7. Remove the phone: slides down into the abyss (p: 0.40 -> 0.52) ────
    .to('#ph', {
      y: '115vh',
      scale: 0.82,
      opacity: 0,
      rotateX: 28,
      duration: 1.0,
      ease: 'power2.in',
    })
    .to('.phone-scene-backdrop, .phone-glow-spill', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in',
    }, '<')
    .to(proxy, {
      p: 0.52,
      duration: 1.0,
      ease: 'power2.in',
      onUpdate: () => window.__setPhase3Progress?.(proxy.p)
    }, '<')

    // ── 8. Phase 3 Prototype: Alive Character & Landing Thoughts (p: 0.52 -> 0.88)
    // The character lives, breathes, chest pulses with heartbeat, eyes follow mouse.
    // Words drift in from screen edges and land on his body with physical flinches!
    .to(proxy, {
      p: 0.88,
      duration: 5.5,
      ease: 'none',
      onUpdate: () => window.__setPhase3Progress?.(proxy.p)
    })

    // ── 9. Seamless Transition to Phase 4 ASCII Canvas (p: 0.88 -> 1.0) ──────
    .to('#anx', { autoAlpha: 1, duration: 1.0, ease: 'power1.inOut' })
    .to('#wall', { opacity: 1, duration: 1.0, ease: 'power1.inOut' }, '<')
    .to(proxy, {
      p: 1.0,
      duration: 1.0,
      onUpdate: () => window.__setPhase3Progress?.(proxy.p)
    }, '<')
    .to('#phoneScene', { autoAlpha: 0, duration: 0.35 });
}
