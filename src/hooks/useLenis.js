import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animations/motion'

/** Keeps smooth scrolling and ScrollTrigger on the same animation clock. */
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    window.__lenis = lenis
    const update = (time) => lenis.raf(time * 1000)

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(500, 33)

    return () => {
      window.__lenis = null
      lenis.destroy()
      gsap.ticker.remove(update)
    }
  }, [])
}
