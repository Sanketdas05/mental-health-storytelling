export function addThoughtsScene(timeline) {
  const phoneProxy = { staticAmp: 1.0 };

  return timeline
    .addLabel('phone-enter')
    // ── 1. Enter Phase 3 Phone Scene ─────────────────────────────────────────
    .to('#phoneScene', { autoAlpha: 1, duration: 0.35 })

    // Before any message: static only, with character glimpsed intermittently (~1 viewport of scroll)
    .to({}, { duration: 0.8 })

    // Static amplitude eases from 1.0 down to ~0.2 over ~2.0s as connection resolves
    .to(phoneProxy, {
      staticAmp: 0.2,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        window.__setPhoneStaticAmp?.(phoneProxy.staticAmp);
      }
    }, '+=0.05')

    // ── 2. Message 1 (Incoming): "hey… you okay?" (off-white, left) ───────────
    .call(() => {
      window.__triggerPhoneTearFlash?.();
      const lbl = document.getElementById('phoneStatusLabel');
      if (lbl) lbl.innerHTML = 'INCOMING<span class="phone-dots">.</span>';
    })
    .to('#m1', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.15')

    // ── 3. Pause with typing indicator "…" ───────────────────────────────────
    .to({}, { duration: 0.35 })
    .to('#mTyping', { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' })
    .to({}, { duration: 0.55 })
    .to('#mTyping', { opacity: 0, duration: 0.15 })

    // ── 4. Reply (Send): "I'm fine :)" (phosphor green, right-aligned) ────────
    .call(() => {
      window.__triggerPhoneTearFlash?.();
      const lbl = document.getElementById('phoneStatusLabel');
      if (lbl) lbl.innerHTML = 'TX: SENT';
    })
    .to('#m2', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.08')
    .to({}, { duration: 0.45 })

    // ── 5. Message 3 (Incoming): "you sure?" ─────────────────────────────────
    .call(() => {
      window.__triggerPhoneTearFlash?.();
      const lbl = document.getElementById('phoneStatusLabel');
      if (lbl) lbl.innerHTML = 'INCOMING<span class="phone-dots">..</span>';
    })
    .to('#m3', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.15')
    .to({}, { duration: 0.45 })

    // ── 6. Message 4 (Reply): "yeah. all good :)" ────────────────────────────
    .call(() => {
      window.__triggerPhoneTearFlash?.();
      const lbl = document.getElementById('phoneStatusLabel');
      if (lbl) lbl.innerHTML = 'TX: SENT';
    })
    .to('#m4', { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.08')

    // Settle phone into faint static
    .to(phoneProxy, {
      staticAmp: 0.06,
      duration: 0.65,
      ease: 'power1.out',
      onUpdate: () => {
        window.__setPhoneStaticAmp?.(phoneProxy.staticAmp);
      }
    })

    // Hold so the isolation feeling and fake "all good :)" register
    .to({}, { duration: 0.85 })

    // ── 7. Remove the phone: slides down and drops away into the abyss ────────
    .to('#ph', {
      y: '110vh',
      scale: 0.82,
      opacity: 0,
      rotateX: 28,
      duration: 0.95,
      ease: 'power2.in',
    })
    .to('.phone-scene-backdrop, .phone-glow-spill', {
      opacity: 0,
      duration: 0.75,
      ease: 'power2.in',
    }, '<')

    // ── 8. Bring the main character into the CENTER (seamless transparent background) ─
    .to('#prof', {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      ease: 'power2.out',
    }, '<0.2')

    // ── 9. Thoughts appear around him (exact halo from your screenshot) ──────
    .to('.thought-item', {
      opacity: 1,
      scale: 1,
      stagger: 0.04,
      duration: 0.6,
      ease: 'back.out(1.4)',
    }, '<0.3')

    // Subtle emotional breathing drift on thoughts
    .to('.thought-item', {
      y: (i) => (i % 2 === 0 ? -14 : 14),
      x: (i) => (i % 3 === 0 ? 10 : -10),
      duration: 2.2,
      ease: 'sine.inOut',
    })

    // ── 10. TEXT BLEND TRANSITION into ASCII ─────────────────────────────────
    .to('#thoughtMatrix', {
      opacity: 0.85,
      duration: 1.2,
      ease: 'power2.inOut',
    }, '<0.5')
    .to('.matrix-row', {
      x: (i) => (i % 2 === 0 ? -120 : 120),
      duration: 1.8,
      ease: 'none',
    }, '<')
    .to('.thought-item', {
      scale: 1.35,
      letterSpacing: '0.12em',
      opacity: 0,
      stagger: 0.025,
      duration: 0.9,
      ease: 'power2.inOut',
    }, '<0.3')

    // Seamlessly cross-fade into Phase 4 ASCII Canvas (#anx / #wall)
    .to('#anx', { autoAlpha: 1, duration: 1.0, ease: 'power1.inOut' }, '<0.4')
    .to('#wall', { opacity: 1, duration: 1.0, ease: 'power1.inOut' }, '<')
    .to('#prof', {
      opacity: 0,
      scale: 1.04,
      duration: 0.9,
      ease: 'power2.inOut',
    }, '<0.1')
    .to('#thoughtMatrix', { opacity: 0, duration: 0.4 }, '<0.6')
    .to('#phoneScene', { autoAlpha: 0, duration: 0.2 }, '<0.2');
}
