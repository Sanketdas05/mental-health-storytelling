import { gsap, ScrollTrigger } from '../motion'

export function addLivingRoomScene(timeline) {
  // ── Event listener for phone reveal (fired by LivingRoom after spatial dolly) ──
  const onRevealPhone = () => {
    // Synchronize ScrollTrigger scroll position to the phone scene start
    const st = ScrollTrigger.getById('film')
    if (st) {
      const filmTl = st.animation
      let targetTime = null
      if (filmTl.labels['phone-enter'] !== undefined) {
        targetTime = filmTl.labels['phone-enter'] + 0.5
      } else if (filmTl.labels['workstation-exit'] !== undefined) {
        targetTime = filmTl.labels['workstation-exit'] + 0.5
      }

      if (targetTime !== null) {
        const prog = targetTime / filmTl.totalDuration()
        const targetScroll = st.start + prog * (st.end - st.start)
        
        // Immediately sync scrub tween & animation progress to prevent scrub lag from flashing workstation
        if (st.scrubTween) {
          st.scrubTween.progress(1)
        }
        filmTl.progress(prog)

        if (window.__lenis) {
          window.__lenis.scrollTo(targetScroll, { immediate: true })
        } else {
          window.scrollTo(0, targetScroll)
        }
        st.update()
      }
    }
    // No autoplay or timeout chains! Pauses on #m1 until user explicitly acts.
  }

  window.removeEventListener('workstation:reveal-phone', onRevealPhone)
  window.addEventListener('workstation:reveal-phone', onRevealPhone)

  return timeline
    // ── 1. Match-cut: Camera begins close on laptop FINE screen, pulls back to reveal desk ──
    .addLabel('workstation-enter')
    .fromTo('.room-wrap', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, '<0.05')
    .fromTo('.living-room', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, '<')
    .fromTo('.ws-bg-layer', { opacity: 0 }, { opacity: 1, duration: 0.4 }, '<')
    // Camera starts zoomed tight on the green "FINE." laptop screen, then pulls back
    .fromTo('.ws-desk-layer',
      { opacity: 0, scale: 2.15, transformOrigin: '45.7% 44.5%' },
      { opacity: 1, scale: 1.0, duration: 0.85, ease: 'power2.out' }, '<')
    .fromTo('.ws-char-layer',
      { opacity: 0, scale: 1.25, transformOrigin: '50% 50%' },
      { opacity: 1, scale: 1.0, duration: 0.85, ease: 'power2.out' }, '<0.15')
    .fromTo('.ws-caption', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, '<0.25')

    // ── 2. Hold on character + desk establishing shot ───────────────────────────
    .addLabel('workstation-char')
    .to({}, { duration: 0.55 })

    // ── 3. Camera pushes forward past character onto first-person desk POV ────
    .to('.ws-caption', { opacity: 0, y: -8, duration: 0.35 })
    .to('.ws-char-layer', { opacity: 0, scale: 1.45, duration: 0.75, ease: 'power2.in' }, '<')
    .to('.ws-desk-layer', { scale: 1.08, duration: 0.75, ease: 'power2.out' }, '<')

    // ── 4. Workstation desk interactive hold point ────────────────────────────
    .addLabel('workstation-desk')
    .call(() => {
      const ws = document.querySelector('.room-wrap')
      if (ws?.__wsAtDesk) ws.__wsAtDesk()
    })
    .to({}, { duration: 0.9 })

    // ── 5. Workstation exit (Camera dollies smoothly towards desk phone) ───
    .addLabel('workstation-exit')
    .to('.ws-desk-layer', {
      transformOrigin: '78.85% 82.03%',
      scale: 3.8,
      x: () => -(0.7885 - 0.5) * window.innerWidth,
      y: () => -(0.8203 - 0.5) * window.innerHeight,
      duration: 0.75,
      ease: 'power2.inOut'
    })
    .to('.ws-bg-layer', {
      scale: 1.6,
      x: () => -(0.7885 - 0.5) * window.innerWidth * 0.35,
      y: () => -(0.8203 - 0.5) * window.innerHeight * 0.35,
      duration: 0.75,
      ease: 'power2.inOut'
    }, '<')
    .to('.ws-phone-ambient-glow', {
      opacity: 1,
      scale: 1.6,
      duration: 0.5
    }, '<0.15')
    .to('.room-wrap', {
      autoAlpha: 0,
      duration: 0.45,
      ease: 'power1.inOut'
    }, '> -0.2')
}
