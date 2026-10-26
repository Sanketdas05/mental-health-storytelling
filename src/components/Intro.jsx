import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../animations/motion'
import { gsap } from '../animations/motion'

// ─── CRT Grain Canvas ───────────────────────────────────────────────────────
// Animated, frame-varied grain rendered on canvas for true live analog noise.
function useCRTGrain(canvasRef, active) {
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width  = Math.ceil(canvas.offsetWidth  * dpr)
      canvas.height = Math.ceil(canvas.offsetHeight * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Bake a small set of grain frames at low resolution and stretch them —
    // this gives the coarse vintage analog look without per-pixel expensiveness.
    const GW = 220, GH = 140
    const off = document.createElement('canvas')
    off.width = GW; off.height = GH
    const gctx = off.getContext('2d')

    const FRAMES = 6
    const grainFrames = []
    for (let f = 0; f < FRAMES; f++) {
      const d = gctx.createImageData(GW, GH)
      const buf = new Uint32Array(d.data.buffer)
      for (let i = 0; i < buf.length; i++) {
        const r = Math.random()
        // bimodal: mostly very dark or bright salt-pepper noise
        const v = r < 0.58 ? (Math.random() * 14) | 0 : (Math.random() * 80 + 175) | 0
        const a = (Math.random() * 140 + 30) | 0
        buf[i] = (a << 24) | (v << 16) | (v << 8) | v
      }
      gctx.putImageData(d, 0, 0)
      const url = off.toDataURL('image/jpeg', 0.82)
      const img = new Image()
      img.src = url
      grainFrames.push(img)
    }

    let fi = 0, last = 0
    const tick = (t) => {
      animId = requestAnimationFrame(tick)
      if (t - last < 55) return   // ~18 fps – vintage analog rate
      last = t
      fi = (fi + 1) % FRAMES
      const img = grainFrames[fi]
      if (!img.complete) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 0.38
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    animId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, active])
}

// ─── Horizontal signal tearing ────────────────────────────────────────────
function useSignalTear(canvasRef, active) {
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let nextTear = 0

    const tick = (t) => {
      animId = requestAnimationFrame(tick)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (t >= nextTear) {
        // Occasional horizontal signal tear / RGB shift stripe
        const tearCount = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < tearCount; i++) {
          const y = (Math.random() * canvas.height) | 0
          const h = (Math.random() * 4 + 1) | 0
          const shift = (Math.random() * 14 - 7) | 0
          ctx.save()
          ctx.globalAlpha = Math.random() * 0.55 + 0.18
          // R channel shift
          ctx.globalCompositeOperation = 'screen'
          ctx.fillStyle = `rgba(199,244,100,0.55)`
          ctx.fillRect(0 + shift, y, canvas.width, h)
          ctx.restore()
        }
        nextTear = t + 600 + Math.random() * 3200
      }
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [canvasRef, active])
}

export function Intro({ poweredBy = false }) {
  const sectionRef   = useRef(null)
  const grainRef     = useRef(null)
  const tearRef      = useRef(null)
  const crtRef       = useRef(null)
  const titleRef     = useRef(null)
  const powerLineRef = useRef(null)
  const poweredOn    = useRef(false)

  const reduced = prefersReducedMotion()

  // Animated grain on a canvas layer
  useCRTGrain(grainRef, !reduced)
  // Signal tearing on a second canvas layer
  useSignalTear(tearRef, !reduced)

  // Power-on sequence + pointer parallax
  useEffect(() => {
    const section = sectionRef.current
    const crt     = crtRef.current
    const title   = titleRef.current
    if (!section || !crt || !title) return

    // ─── Pointer parallax (restrained) ─────────────────────────────────────
    if (!reduced && window.matchMedia('(pointer: fine)').matches) {
      let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5
      let raf
      const onMove = ({ clientX, clientY }) => {
        const r = section.getBoundingClientRect()
        tx = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
        ty = Math.max(0, Math.min(1, (clientY - r.top)  / r.height))
      }
      const loop = () => {
        raf = requestAnimationFrame(loop)
        mx += (tx - mx) * 0.07
        my += (ty - my) * 0.07
        const dx = (mx - 0.5) * 18
        const dy = (my - 0.5) * 10
        // Subtle tilt on the CRT bezel
        crt.style.transform = `perspective(1400px) rotateY(${-dx * 0.25}deg) rotateX(${dy * 0.18}deg)`
        // Phosphor glow shifts with pointer
        section.style.setProperty('--mouse-x', `${(mx * 100).toFixed(1)}%`)
        section.style.setProperty('--mouse-y', `${(my * 100).toFixed(1)}%`)
      }
      raf = requestAnimationFrame(loop)
      section.addEventListener('pointermove', onMove)
      section.addEventListener('pointerleave', () => { tx = 0.5; ty = 0.5 })
      return () => {
        cancelAnimationFrame(raf)
        section.removeEventListener('pointermove', onMove)
      }
    }
  }, [reduced])

  // ─── Set CRT to initial cathode-line state on mount (hidden until preloader hands off) ─
  useEffect(() => {
    gsap.set('.crt-screen-inner', { scaleY: 0.003, autoAlpha: 0 })
    gsap.set('.crt-scanlines, .crt-vignette, .crt-curvature', { autoAlpha: 0 })
    gsap.set('.crt-title-wrap', { autoAlpha: 0 })
    gsap.set('.crt-eyebrow, .crt-deck, .scroll-cue', { autoAlpha: 0, y: 14 })
  }, [])

  // ─── Unified bootup sequence — seamlessly continues the cathode line expansion ─
  useEffect(() => {
    if (!poweredBy || poweredOn.current) return
    poweredOn.current = true

    if (reduced) {
      gsap.set('.crt-title-wrap, .crt-eyebrow, .crt-deck, .scroll-cue', { autoAlpha: 1, y: 0 })
      gsap.set('.crt-screen-inner', { opacity: 1, scaleY: 1, filter: 'brightness(1)', autoAlpha: 1 })
      gsap.set('.crt-scanlines, .crt-vignette, .crt-curvature', { autoAlpha: 1 })
      return
    }

    const tl = gsap.timeline()

    // 0ms handoff from preloader: screen inner matches the bright horizontal cathode line
    gsap.set('.crt-screen-inner', { scaleY: 0.003, autoAlpha: 1, filter: 'brightness(3)' })

    tl
      // 1. Line expands vertically to full screen
      .to('.crt-screen-inner', {
        scaleY: 1,
        filter: 'brightness(1)',
        duration: 0.48,
        ease: 'expo.out',
      })
      // 2. Scanlines & vignette bloom into place as phosphor illuminates
      .to('.crt-scanlines', { autoAlpha: 1, duration: 0.3 }, '<0.08')
      .to('.crt-vignette, .crt-curvature', { autoAlpha: 1, duration: 0.4 }, '<')
      // 3. Phosphor title flickers to life
      .to('.crt-title-wrap', { autoAlpha: 1, duration: 0.04 }, '<0.18')
      .to('.crt-title-wrap', { autoAlpha: 0.15, duration: 0.04 }, '<0.06')
      .to('.crt-title-wrap', { autoAlpha: 1, duration: 0.04 }, '<0.05')
      .to('.crt-title-wrap', { autoAlpha: 0.5, duration: 0.08 }, '<0.08')
      .to('.crt-title-wrap', { autoAlpha: 1, duration: 0.22, ease: 'power2.out' }, '<0.05')
      // 4. Sub-text & scroll cue settle in
      .to('.crt-eyebrow', { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '<0.15')
      .to('.crt-deck', { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '<0.1')
      .to('.scroll-cue', { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.15')
  }, [reduced, poweredBy])

  // Expose idempotent reset for intro re-entry
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    section.__introReset = () => {
      gsap.set('.crt-title-wrap, .crt-eyebrow, .crt-deck, .scroll-cue', { autoAlpha: 1, y: 0 })
      gsap.set('.crt-screen-inner', { opacity: 1, scaleY: 1, filter: 'brightness(1)', autoAlpha: 1 })
      gsap.set('.crt-scanlines, .crt-vignette, .crt-curvature', { autoAlpha: 1 })
      gsap.set('.crt-bezel', { scale: 1, clearProps: 'transform' })
      gsap.set('.crt-intro', { autoAlpha: 1 })
      gsap.set('.crt-portal-flash', { autoAlpha: 0 })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="intro crt-intro scene"
      aria-labelledby="intro-title"
      style={{ '--mouse-x': '50%', '--mouse-y': '50%' }}
    >
      {/* ─── Obsidian room behind the CRT ──────────────────────────────── */}
      <div className="crt-room" aria-hidden="true">
        <div className="crt-room-grain" />
      </div>

      {/* ─── The CRT Monitor bezel ─────────────────────────────────────── */}
      <div className="crt-bezel" ref={crtRef} aria-hidden="true">

        {/* Screen face */}
        <div className="crt-screen-face">

          {/* Inner content — scales from 0 on power-on */}
          <div className="crt-screen-inner">

            {/* Animated grain canvas */}
            <canvas ref={grainRef} className="crt-grain-canvas" aria-hidden="true" />
            {/* Signal tear canvas */}
            <canvas ref={tearRef} className="crt-tear-canvas" aria-hidden="true" />

            {/* Scanlines */}
            <div className="crt-scanlines" aria-hidden="true" />

            {/* Phosphor glow from pointer */}
            <div className="crt-phosphor" aria-hidden="true" />

            {/* ── Main CRT content ── */}
            <div className="crt-content">

              {/* Story index / kicker */}
              <p className="crt-eyebrow eyebrow type-narrator">THE THINGS WE CARRY <span>00</span></p>

              {/* Giant editorial title */}
              <div className="crt-title-wrap" ref={titleRef}>
                <p className="crt-overline type-narrator">AN INTERACTIVE ESSAY</p>
                <h1 id="intro-title" className="crt-title">
                  <span className="crt-title-im type-speech">I'M</span>
                  <em className="crt-title-fine type-thought">FINE.</em>
                </h1>
              </div>

              {/* Deck */}
              <p className="crt-deck type-narrator">It's the answer that asks for nothing back.</p>

              {/* Scroll cue */}
              <div className="scroll-cue type-narrator" aria-label="Scroll to enter">
                <span className="scroll-cue-line" />
                SCROLL TO DESCEND
              </div>
            </div>

            {/* Screen curvature / barrel distortion overlay */}
            <div className="crt-curvature" aria-hidden="true" />

            {/* Vignette — dark edges */}
            <div className="crt-vignette" aria-hidden="true" />

          </div>{/* /crt-screen-inner */}

          {/* Bezel chrome reflection */}
          <div className="crt-reflection" aria-hidden="true" />

        </div>{/* /crt-screen-face */}

        {/* Bottom speaker grille detail */}
        <div className="crt-bottom-grille" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => <span key={i} />)}
        </div>

      </div>{/* /crt-bezel */}

      {/* ─── CRT portal zoom target (fills viewport on scroll) ─────────── */}
      <div className="crt-portal-flash" aria-hidden="true" />

    </section>
  )
}
