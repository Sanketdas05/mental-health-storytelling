import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Creates a scoped GSAP context that is automatically reverted by React. */
export const createScene = (scope, build) => {
  if (prefersReducedMotion() || !scope.current) return () => undefined
  const context = gsap.context(build, scope)
  return () => context.revert()
}

export { gsap, ScrollTrigger }
