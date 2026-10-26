import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../animations/motion';

export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on fine pointers (mouse) and if reduced-motion is not requested
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let rafId;

    const onPointerMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) setVisible(true);
    };

    const onPointerDown = () => ring.classList.add('is-down');
    const onPointerUp = () => ring.classList.remove('is-down');

    const checkHover = (e) => {
      const target = e.target;
      if (!target) return;
      const isInteractive = target.closest('button, a, [role="button"], input, textarea, .ws-desk-interactive, .chapter-indicator-btn, .entry-enter-btn');
      setHovered(!!isInteractive);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointerover', checkHover, { passive: true });

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;

      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointerover', checkHover);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`custom-cursor-root ${hovered ? 'is-hover' : ''}`} aria-hidden="true">
      <div ref={ringRef} className="custom-cursor-ring" />
      <div ref={dotRef} className="custom-cursor-dot" />
    </div>
  );
}
