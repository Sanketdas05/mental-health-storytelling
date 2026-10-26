import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, createScene } from './animations/motion'
import { useLenis } from './hooks/useLenis'
import { addIntroScene } from './animations/scenes/intro'
import { addLivingRoomScene } from './animations/scenes/livingRoom'
import { addThoughtsScene } from './animations/scenes/thoughts'
import { addAnxietyScene } from './animations/scenes/anxiety'
import { addHandsScene } from './animations/scenes/hands'
import { Intro } from './components/Intro'
import { Interlude } from './components/Interlude'
import { LivingRoom } from './components/LivingRoom'
import { Thoughts } from './components/Thoughts'
import { AnxietyScene } from './components/AnxietyScene'
import { HandsScene } from './components/HandsScene'
import { StoryProgress } from './components/StoryProgress'
import { EntryGate } from './components/EntryGate'
import { CustomCursor } from './components/CustomCursor'
import { audioManager } from './utils/audio'

export default function App() {
  const app = useRef(null)
  const [progress, setProgress] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hasEntered, setHasEntered] = useState(false)
  const anxRef = useRef(null)
  useLenis()

  const handleToggleSound = () => {
    const isMuted = audioManager.toggleMute()
    setSoundEnabled(!isMuted)
  }

  const handleEnterExperience = () => {
    setHasEntered(true)
  }

  useEffect(() => createScene(app, () => {
    gsap.set('.interlude, .room-wrap, #phoneScene, .anxiety-scene, .hands-scene', { autoAlpha: 0 })
    const film = gsap.timeline({
      scrollTrigger: {
        id: 'film',
        trigger: '.story', start: 'top top', end: '+=850%',
        scrub: 0.45, pin: true, anticipatePin: 1,
        onUpdate: self => {
          setProgress(self.progress)
          // Drive ambient audio evolution from scroll progress
          audioManager.setScrollProgress(self.progress)
          if (self.progress <= 0.005) {
            const intro = document.querySelector('.crt-intro')
            if (intro?.__introReset) intro.__introReset()
            const ws = document.querySelector('.room-wrap')
            if (ws?.__wsReset) ws.__wsReset()
          }
          const ws = document.querySelector('.room-wrap')
          if (ws?.__getDeskProg) {
            const dp = ws.__getDeskProg()
            const ds = ws.__getDeskScroll ? ws.__getDeskScroll() : null
            const ep = ws.__getExitProg ? ws.__getExitProg() : null

            if (dp !== null) {
              // When scrolling BACKWARD from Phase 3/4 into workstation:
              // Immediately restore unzoomed desk if it was dollied
              if (self.direction === -1 && ep !== null && self.progress <= ep + 0.02) {
                if (ws.__resetDolly) ws.__resetDolly()
              }

              if (self.progress < dp - 0.02 && ws.__wsLeaveDesk) {
                ws.__wsLeaveDesk()
              }
              if (ws.__isLocked && ws.__isLocked() && ds !== null && self.progress > dp + 0.002) {
                if (window.__lenis) {
                  window.__lenis.scrollTo(ds, { immediate: true })
                } else {
                  self.scroll(ds)
                }
                return
              }
            }
          }
          if (anxRef.current) {
            const filmTl = self.animation;
            if (filmTl && filmTl.labels && filmTl.labels['anxiety-enter'] !== undefined && filmTl.labels['anxiety-exit'] !== undefined) {
              const total = filmTl.totalDuration();
              const startProg = filmTl.labels['anxiety-enter'] / total;
              const exitProg = filmTl.labels['anxiety-exit'] / total;
              const local = Math.max(0, Math.min(1, (self.progress - startProg) / (exitProg - startProg)));
              anxRef.current.progress = local;
            } else {
              const t = self.progress;
              const local = Math.max(0, Math.min(1, (t - 0.58) / (0.88 - 0.58)));
              anxRef.current.progress = local;
            }
          }
        }
      }
    })
    addIntroScene(film)
    film
      .to('.interlude', { autoAlpha: 1, duration: .14 }, '<.15')
      .from('.interlude-copy, .interlude > .eyebrow, .interlude-foot', { y: 30, autoAlpha: 0, stagger: .08, duration: .42 }, '<.08')
      .to('.interlude-copy, .interlude > .eyebrow, .interlude-foot', { autoAlpha: 0, duration: .32, delay: .25 })
      .to('.interlude', { autoAlpha: 0, duration: .12 })
    addLivingRoomScene(film)
    addThoughtsScene(film)
    addAnxietyScene(film)
    addHandsScene(film)
  }), [])

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('resize', refresh)
    return () => window.removeEventListener('resize', refresh)
  }, [])

  return (
    <main ref={app}>
      {/* ── Entry Gate with Audio Unlock & Preloader ── */}
      {!hasEntered && <EntryGate onEnter={handleEnterExperience} />}

      {/* ── Fluid Custom Cursor ── */}
      <CustomCursor />

      {/* ── Global Unified Grain & Vignette Overlay ── */}
      <div className="global-grain-vignette" aria-hidden="true">
        <div className="global-grain-layer" />
        <div className="global-vignette-layer" />
      </div>

      {/* ── Minimal Persistent Audio Toggle Control ── */}
      {hasEntered && (
        <button
          className={`minimal-sound-btn ${soundEnabled ? 'is-active' : 'is-muted'}`}
          onClick={handleToggleSound}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          <span className="sound-wave-icon" aria-hidden="true">
            <span className="wave-bar b1" />
            <span className="wave-bar b2" />
            <span className="wave-bar b3" />
          </span>
          <span className="sound-btn-label">SOUND: {soundEnabled ? 'ON' : 'OFF'}</span>
        </button>
      )}

      <StoryProgress value={progress} />

      <div className="story">
        <Intro poweredBy={hasEntered} />
        <Interlude />
        <LivingRoom soundEnabled={soundEnabled} />
        <Thoughts />
        <AnxietyScene stateRef={anxRef} />
        <HandsScene />
      </div>

      <span className="sr-only">An interactive story about reaching out for support.</span>
    </main>
  )
}
