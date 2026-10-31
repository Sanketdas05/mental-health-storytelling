import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../animations/motion';

export function CustomCursor() {
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Only enable custom cursor on fine pointers (mouse) and if reduced-motion is not requested
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!root || !dot || !ring) return;

    // Enable custom cursor styling on document
    document.documentElement.classList.add('has-custom-cursor');

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let isVisible = false;
    let isHover = false;
    let rafId = null;

    const onPointerMove = (e) => {
      mx = e.clientX;
      my = e.clientY;

      if (!isVisible) {
        isVisible = true;
        rx = mx;
        ry = my;
        root.classList.add('is-visible');
      }
    };

    const onPointerDown = () => {
      root.classList.add('is-down');
    };

    const onPointerUp = () => {
      root.classList.remove('is-down');
    };

    const onPointerOver = (e) => {
      const target = e.target;
      if (!target) return;

      const interactive = target.closest(
        'button, a, [role="button"], input, textarea, select, label, ' +
        '.ws-desk-interactive, .ws-beat-dot, .chapter-indicator-btn, .entry-enter-btn, ' +
        '.card-copy-btn, .top-link, .phone, .hotspot, [data-cursor-hover]'
      );

      const shouldHover = !!interactive;
      if (shouldHover !== isHover) {
        isHover = shouldHover;
        root.classList.toggle('is-hover', isHover);
      }
    };

    const onPointerLeave = () => {
      isVisible = false;
      root.classList.remove('is-visible');
    };

    const onPointerEnter = (e) => {
      mx = e.clientX;
      my = e.clientY;
      isVisible = true;
      root.classList.add('is-visible');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointerover', onPointerOver, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('pointerenter', onPointerEnter, { passive: true });

    const loop = () => {
      rafId = requestAnimationFrame(loop);

      if (!isVisible) return;

      // Smooth trailing interpolation for the outer ring
      rx += (mx - rx) * 0.20;
      ry += (my - ry) * 0.20;

      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('pointerenter', onPointerEnter);
    };
  }, []);

  return (
    <div ref={rootRef} className="custom-cursor-root" aria-hidden="true">
      <div ref={ringRef} className="custom-cursor-ring" />
      <div ref={dotRef} className="custom-cursor-dot" />
    </div>
  );
}
