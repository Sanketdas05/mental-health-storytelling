import { useEffect, useRef, useCallback, useState } from 'react';
import { gsap, ScrollTrigger } from '../animations/motion';
import { prefersReducedMotion } from '../animations/motion';
import { audioManager } from '../utils/audio';

// Parallax depth per layer for subtle exploratory depth
const DEPTH = { bg: 1.6, desk: 0.35 };
const LOOK_BOUNDS = { x: 44, y: 22 };


const WORKSTATION_STORIES = {
  photo: {
    tag: "A Framed Memory",
    preview: "Sarah · September '20",
    text: "A weekend at the coast with Sarah. 'Promise me you'll stop working past midnight.' You haven't answered her calls in three weeks.",
    sub: "September '20 · Before everything got quiet",
    accent: "#d4a574",
    x: 75.9,
    y: 44.0,
    tx: "-50%"
  },
  noteLeft: {
    tag: "Sticky Note",
    preview: "Call Mom back",
    text: "Call Mom back. (Her voicemail from Sunday is still saved: 'Just wanted to hear your voice, honey. Call whenever you have a minute.')",
    sub: "Yellow Post-It · 3 days ago",
    accent: "#e8c374",
    x: 26.5,
    y: 62.0,
    tx: "-35%"
  },
  noteRight: {
    tag: "Sticky Note",
    preview: "9 AM Standup reminder",
    text: "9:00 AM Standup: 'Everything on my side is smooth and on track.' (Smile. Don't let anyone hear the exhaustion in your voice.)",
    sub: "Scrawled in blue ballpoint",
    accent: "#e8c374",
    x: 69.2,
    y: 65.0,
    tx: "-65%"
  },
  coffee: {
    tag: "Fourth Cup",
    preview: "Cold black coffee",
    text: "Cold black coffee. Your hands have a faint tremor from the caffeine and lack of sleep that you keep trying to ignore.",
    sub: "Mug went cold around 1:00 AM",
    accent: "#c4a07a",
    x: 87.1,
    y: 56.0,
    tx: "-85%"
  },
  laptop: {
    tag: "Terminal",
    preview: "03:14 AM · git commit -m 'no issues'",
    text: "> git commit -m 'no issues' — You've been staring at the same twelve lines of code since midnight, rewriting logic that doesn't need to be changed.",
    sub: "Keeping busy so you don't have to think",
    accent: "#C7F464",
    x: 45.8,
    y: 31.0,
    tx: "-50%"
  },
  lamp: {
    tag: "Desk Lamp",
    preview: "Click to toggle light",
    text: "You flick the small switch on the lamp base. In the dimness, the screens burn brighter, and the silence in the room deepens.",
    sub: "Click switch to toggle light",
    accent: "#FFE08A",
    x: 18.5,
    y: 56.0,
    tx: "-20%"
  },
  phone: {
    tag: "Incoming Notification",
    preview: "Mom: 'Are you still awake?'",
    text: "Your screen lights up in the corner of your eye. A text from Mom: 'Are you still awake?'",
    sub: "Click to check your phone",
    accent: "#C7F464",
    x: 80.25,
    y: 74.0,
    tx: "-50%"
  }
};

export function LivingRoom({ soundEnabled = true }) {
  const wrapRef = useRef(null);
  const lookRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const rafRef = useRef(null);
  const rafActiveRef = useRef(false);
  const atDeskRef = useRef(false);
  const phoneClickedRef = useRef(false);
  const dollyTlRef = useRef(null);
  const cardTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const suppressWhisperRef = useRef(false);

  const [phoneClicked, setPhoneClicked] = useState(false);
  const [atDesk, setAtDesk] = useState(false);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [clickedKey, setClickedKey] = useState(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [isFadingCard, setIsFadingCard] = useState(false);
  const [lampOn, setLampOn] = useState(true);

  const reduced = prefersReducedMotion();

  // ─── Global Key Listener for Dismissing Cards ────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
        setCardVisible(false);
        setIsFadingCard(true);
        setHoveredKey(null);
        suppressWhisperRef.current = false;
        fadeTimerRef.current = setTimeout(() => {
          setClickedKey(null);
          setIsFadingCard(false);
        }, 880);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  // ─── Desk Scroll Information ─────────────────────────────────────────────
  const getDeskInfo = useCallback(() => {
    const st = ScrollTrigger.getById('film');
    if (!st || !st.animation) return null;
    const film = st.animation;
    if (!film.labels || film.labels['workstation-desk'] === undefined) return null;
    const total = film.totalDuration();
    const deskProg = film.labels['workstation-desk'] / total;
    const deskScroll = st.start + deskProg * (st.end - st.start);
    const exitProg = film.labels['workstation-exit'] !== undefined ? film.labels['workstation-exit'] / total : deskProg + 0.05;
    const exitScroll = st.start + exitProg * (st.end - st.start);
    return { st, film, deskProg, deskScroll, exitProg, exitScroll };
  }, []);

  // ─── Local Gate for Downward Wheel / Touch Navigation ────────────────────
  useEffect(() => {
    let touchStartY = 0;

    const onWheel = (e) => {
      if (phoneClickedRef.current) return;
      const info = getDeskInfo();
      if (!info) return;

      if (window.scrollY >= info.deskScroll - 2 && e.deltaY > 0) {
        e.preventDefault();
      }
    };

    const onTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (phoneClickedRef.current) return;
      const info = getDeskInfo();
      if (!info) return;

      if (window.scrollY >= info.deskScroll - 2 && e.touches && e.touches.length > 0) {
        const currentY = e.touches[0].clientY;
        if (currentY < touchStartY - 2) {
          e.preventDefault();
        }
      }
    };

    const onKeyDown = (e) => {
      if (phoneClickedRef.current) return;
      const info = getDeskInfo();
      if (!info) return;

      if (window.scrollY >= info.deskScroll - 2 && ['ArrowDown', 'PageDown', 'Space', ' ', 'End'].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    window.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    window.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    window.addEventListener('keydown', onKeyDown, { capture: true, passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchstart', onTouchStart, { capture: true });
      window.removeEventListener('touchmove', onTouchMove, { capture: true });
      window.removeEventListener('keydown', onKeyDown, { capture: true });
    };
  }, [getDeskInfo]);

  // ─── Subtle Pointer Look-Around in Desk View ──────────────────────────────
  useEffect(() => {
    if (reduced) return;
    const ws = wrapRef.current;
    if (!ws) return;

    const onMove = (e) => {
      if (!atDeskRef.current || phoneClickedRef.current) return;
      const r = ws.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      lookRef.current.tx = Math.max(-LOOK_BOUNDS.x, Math.min(LOOK_BOUNDS.x, nx * LOOK_BOUNDS.x * 2));
      lookRef.current.ty = Math.max(-LOOK_BOUNDS.y, Math.min(LOOK_BOUNDS.y, ny * LOOK_BOUNDS.y * 2));
    };

    ws.addEventListener('pointermove', onMove, { passive: true });

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      if (!rafActiveRef.current || !atDeskRef.current || phoneClickedRef.current) return;

      const lk = lookRef.current;
      lk.x += (lk.tx - lk.x) * 0.06;
      lk.y += (lk.ty - lk.y) * 0.06;

      const bgl = ws.querySelector('.ws-bg-layer');
      const deskl = ws.querySelector('.ws-desk-layer');

      if (bgl) {
        bgl.style.transform = `translate(${lk.x * DEPTH.bg}px, ${lk.y * DEPTH.bg}px)`;
      }
      if (deskl) {
        deskl.style.transform = `translate(${lk.x * DEPTH.desk}px, ${lk.y * DEPTH.desk}px)`;
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ws.removeEventListener('pointermove', onMove);
    };
  }, [reduced]);

  // ─── Meaningful Story Card Interactions (Hover = whisper, Click = full description) ───
  const handleStoryEnter = (key) => {
    if (!atDeskRef.current || phoneClickedRef.current) return;
    if (clickedKey || isFadingCard || suppressWhisperRef.current) return;
    setHoveredKey(key);
  };

  const handleStoryLeave = (key) => {
    suppressWhisperRef.current = false;
    setHoveredKey((current) => (current === key ? null : current));
  };

  const closeStoryCard = useCallback(() => {
    if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    setCardVisible(false);
    setIsFadingCard(true);
    setHoveredKey(null);
    fadeTimerRef.current = setTimeout(() => {
      setClickedKey(null);
      setIsFadingCard(false);
    }, 880);
  }, []);

  const handleStoryClick = (key, e) => {
    e?.stopPropagation();

    // Clear any existing timers
    if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    suppressWhisperRef.current = true;
    setHoveredKey(null);

    if (key === 'lamp') {
      const willBeOn = !lampOn;
      audioManager.playLampClick(willBeOn);
      setLampOn(willBeOn);
    }

    // Clicking the same card toggles it closed smoothly
    if (clickedKey === key && !isFadingCard) {
      closeStoryCard();
      return;
    }

    setClickedKey(key);
    setIsFadingCard(false);
    setCardVisible(false);

    // Double requestAnimationFrame ensures mounting with initial transform/opacity:0 before smoothly transitioning to is-visible
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCardVisible(true);
      });
    });

    // Auto fade away all descriptions smoothly after 2 seconds
    cardTimerRef.current = setTimeout(() => {
      closeStoryCard();
    }, 2000);
  };

  const handleDeskBgClick = () => {
    if (clickedKey) {
      closeStoryCard();
    }
  };

  // ─── Spatial & Controlled Phone Dolly Transition ──────────────────────────
  const handlePhoneClick = useCallback(() => {
    if (phoneClickedRef.current) return;
    phoneClickedRef.current = true;
    setPhoneClicked(true);
    if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    setClickedKey(null);
    setIsFadingCard(false);
    setHoveredKey(null);

    // Stop parallax rAF so style.transform does not fight GSAP
    rafActiveRef.current = false;
    lookRef.current = { x: 0, y: 0, tx: 0, ty: 0 };

    const ws = wrapRef.current;
    const deskLayer = ws ? ws.querySelector('.ws-desk-layer') : null;
    const bgLayer = ws ? ws.querySelector('.ws-bg-layer') : null;
    const rect = ws ? ws.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };

    // Accurately calibrated to the phone screen center (78.85%, 82.03%)
    const tx = -(0.7885 - 0.5) * rect.width;
    const ty = -(0.8203 - 0.5) * rect.height;

    dollyTlRef.current?.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        window.dispatchEvent(new CustomEvent('workstation:reveal-phone'));
      }
    });
    dollyTlRef.current = tl;

    tl
      .to(deskLayer, {
        transformOrigin: '78.85% 82.03%',
        scale: 3.8,
        x: tx,
        y: ty,
        duration: 0.85,
        ease: 'power2.inOut'
      })
      .to(bgLayer, {
        scale: 1.6,
        x: tx * 0.35,
        y: ty * 0.35,
        duration: 0.85,
        ease: 'power2.inOut'
      }, '<')
      .to('.ws-phone-ambient-glow', {
        opacity: 1,
        scale: 1.6,
        duration: 0.5
      }, '<0.15')
      .to(ws, {
        opacity: 0,
        duration: 0.35,
        ease: 'power1.inOut'
      }, '> -0.25');

  }, []);

  const handlePhoneKey = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePhoneClick();
    }
  }, [handlePhoneClick]);

  // ─── Idempotent Reset and Lifecycle Hooks ─────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    el.__isLocked = () => !phoneClickedRef.current;
    el.__isDollied = () => phoneClickedRef.current;
    el.__getDeskScroll = () => {
      const info = getDeskInfo();
      return info ? info.deskScroll : null;
    };
    el.__getDeskProg = () => {
      const info = getDeskInfo();
      return info ? info.deskProg : null;
    };
    el.__getExitProg = () => {
      const info = getDeskInfo();
      return info ? info.exitProg : null;
    };

    el.__wsAtDesk = () => {
      atDeskRef.current = true;
      setAtDesk(true);
      rafActiveRef.current = !reduced;
    };

    el.__wsLeaveDesk = () => {
      atDeskRef.current = false;
      setAtDesk(false);
      setClickedKey(null);
      setHoveredKey(null);
    };

    el.__resetDolly = () => {
      if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      suppressWhisperRef.current = false;
      setCardVisible(false);
      setIsFadingCard(false);
      if (!phoneClickedRef.current && !dollyTlRef.current) return;
      dollyTlRef.current?.kill();
      dollyTlRef.current = null;
      rafActiveRef.current = !reduced;
      lookRef.current = { x: 0, y: 0, tx: 0, ty: 0 };
      phoneClickedRef.current = false;
      setPhoneClicked(false);
      setClickedKey(null);
      setHoveredKey(null);
      setLampOn(true);

      const deskLayer = el.querySelector('.ws-desk-layer');
      if (deskLayer) {
        gsap.killTweensOf(deskLayer);
        gsap.set(deskLayer, {
          clearProps: 'transform,transformOrigin,scale,x,y',
          opacity: 1
        });
        deskLayer.style.transform = 'translate(0px, 0px)';
      }

      const bgLayer = el.querySelector('.ws-bg-layer');
      if (bgLayer) {
        gsap.killTweensOf(bgLayer);
        gsap.set(bgLayer, {
          clearProps: 'transform,transformOrigin,scale,x,y',
          opacity: 1
        });
        bgLayer.style.transform = 'translate(0px, 0px)';
      }

      gsap.set(el, { clearProps: 'opacity' });
      gsap.set('.ws-phone-ambient-glow', { clearProps: 'opacity,scale' });
      gsap.set('.ws-phone-glow-svg', { clearProps: 'opacity' });
      gsap.set('.room-flash', { autoAlpha: 0 });
    };

    el.__wsReset = () => {
      if (el.__resetDolly) el.__resetDolly();
      atDeskRef.current = false;
      setAtDesk(false);
      setClickedKey(null);
      setHoveredKey(null);
      setLampOn(true);

      const bgLayer = el.querySelector('.ws-bg-layer');
      if (bgLayer) {
        bgLayer.style.transform = 'translate(0px, 0px)';
      }
    };
  }, [reduced, getDeskInfo]);

  const clickedStory = clickedKey ? WORKSTATION_STORIES[clickedKey] : null;
  const hoveredStory = hoveredKey ? WORKSTATION_STORIES[hoveredKey] : null;

  return (
    <section
      className="room-wrap scene"
      aria-labelledby="room-title"
      ref={wrapRef}
    >
      <h2 id="room-title" className="sr-only">The distraction: a late-night workstation</h2>
      <p className="eyebrow room-index type-narrator">THE DISTRACTION <span>01</span></p>

      {/* ═══ SPATIAL WORLD ════════════════════════════════════════════════════ */}
      <div
        className="ws-world living-room"
        aria-label="A late-night workstation. A character sits at a desk wearing headphones, absorbed in work."
      >
        {/* ── Layer 0: Room background — walls, window, night sky ────────── */}
        <div className="ws-bg-layer" aria-hidden="true">
          <img src="/media/ws-bg.jpg" alt="" draggable="false" />
          <div className="ws-layer-grain" />
        </div>

        {/* ── Layer 1: Desk / Table — laptop, coffee, phone ──────────────── */}
        <div className="ws-desk-layer" onClick={handleDeskBgClick}>
          <img src="/media/ws-desk.jpg" alt="" draggable="false" className="ws-desk-img" />

          {/* Deep atmospheric darkness when lamp is toggled off — only screens glow */}
          <div className={`ws-room-darkness ${lampOn ? '' : 'is-dark'}`} aria-hidden="true" />
          <div className={`ws-laptop-glow ${lampOn ? '' : 'is-active'}`} aria-hidden="true" />

          {/* Vivid ambient phone glow when room is dimmed — casts radiant green pool on desk */}
          <div className={`ws-phone-ambient-glow ${lampOn ? '' : 'is-active'}`} aria-hidden="true" />

          <svg
            className="ws-desk-svg"
            viewBox="0 0 1792 1008"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              {/* Restrained green glow definition for phone screen */}
              <radialGradient id="wsPhoneGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8fe03a" stopOpacity="0.45" />
                <stop offset="48%" stopColor="#8fe03a" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#8fe03a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ambient Coffee Steam — slow, subtle, organic, non-interactive */}
            <g className="ws-coffee-steam-group" pointerEvents="none" aria-hidden="true">
              <path className="ws-steam-wisp ws-steam-1" d="M 1548 570 C 1538 540, 1558 510, 1544 470 C 1532 435, 1548 400, 1540 365" />
              <path className="ws-steam-wisp ws-steam-2" d="M 1563 568 C 1574 535, 1552 505, 1568 465 C 1580 430, 1562 395, 1567 360" />
              <path className="ws-steam-wisp ws-steam-3" d="M 1576 572 C 1586 542, 1568 515, 1582 475 C 1592 440, 1575 405, 1580 370" />
            </g>

            {/* ── Interactive Desk Items (Tactile response, no debug boxes) ── */}

            {/* Lamp Base Switch */}
            <g
              className="ws-desk-interactive ws-desk-lamp-switch"
              role="button"
              tabIndex={atDesk && !phoneClicked ? 0 : -1}
              aria-label="Desk lamp switch: click to toggle light."
              onPointerEnter={() => handleStoryEnter('lamp')}
              onPointerLeave={() => handleStoryLeave('lamp')}
              onClick={(e) => handleStoryClick('lamp', e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStoryClick('lamp', e);
                }
              }}
            >
              <ellipse
                cx="275"
                cy="616"
                rx="14"
                ry="9"
                transform="rotate(-20 275 616)"
                fill={lampOn ? "#282420" : "#151413"}
                stroke={lampOn ? "rgba(212, 165, 116, 0.55)" : "rgba(75, 70, 65, 0.4)"}
                strokeWidth="1.2"
              />
              <line
                x1="272"
                y1="609"
                x2="278"
                y2="623"
                stroke={lampOn ? "rgba(255, 230, 160, 0.75)" : "rgba(100, 95, 90, 0.4)"}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="275" cy="616" r="26" fill="transparent" />
            </g>

            {/* Left Sticky Note */}
            <g
              className="ws-desk-interactive ws-desk-note"
              role="button"
              tabIndex={atDesk && !phoneClicked ? 0 : -1}
              aria-label="Sticky note: Call Mom back."
              onPointerEnter={() => handleStoryEnter('noteLeft')}
              onPointerLeave={() => handleStoryLeave('noteLeft')}
              onClick={(e) => handleStoryClick('noteLeft', e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStoryClick('noteLeft', e);
                }
              }}
            >
              <polygon points="410,620 535,610 540,695 415,705" fill="transparent" />
            </g>

            {/* Right Sticky Note */}
            <g
              className="ws-desk-interactive ws-desk-note"
              role="button"
              tabIndex={atDesk && !phoneClicked ? 0 : -1}
              aria-label="Sticky note: 9:00 AM Standup reminder."
              onPointerEnter={() => handleStoryEnter('noteRight')}
              onPointerLeave={() => handleStoryLeave('noteRight')}
              onClick={(e) => handleStoryClick('noteRight', e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStoryClick('noteRight', e);
                }
              }}
            >
              <polygon points="1145,660 1335,650 1340,735 1150,745" fill="transparent" />
            </g>

            {/* Laptop Screen Terminal Hit Area (no clashing text overlay) */}
            <g
              className="ws-desk-interactive ws-desk-laptop"
              role="button"
              tabIndex={atDesk && !phoneClicked ? 0 : -1}
              aria-label="Laptop terminal screen."
              onPointerEnter={() => handleStoryEnter('laptop')}
              onPointerLeave={() => handleStoryLeave('laptop')}
              onClick={(e) => handleStoryClick('laptop', e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStoryClick('laptop', e);
                }
              }}
            >
              <rect x="625" y="315" width="390" height="262" rx="8" fill="transparent" />
            </g>

            {/* Photo Frame */}
            <g
              className="ws-desk-interactive ws-desk-photo"
              role="button"
              tabIndex={atDesk && !phoneClicked ? 0 : -1}
              aria-label="Framed photo of you and Sarah."
              onPointerEnter={() => handleStoryEnter('photo')}
              onPointerLeave={() => handleStoryLeave('photo')}
              onClick={(e) => handleStoryClick('photo', e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStoryClick('photo', e);
                }
              }}
            >
              <rect x="1265" y="445" width="195" height="230" rx="4" fill="transparent" />
            </g>

            {/* Coffee Mug */}
            <g
              className="ws-desk-interactive ws-desk-coffee"
              role="button"
              tabIndex={atDesk && !phoneClicked ? 0 : -1}
              aria-label="Cold mug of coffee."
              onPointerEnter={() => handleStoryEnter('coffee')}
              onPointerLeave={() => handleStoryLeave('coffee')}
              onClick={(e) => handleStoryClick('coffee', e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStoryClick('coffee', e);
                }
              }}
            >
              <rect x="1485" y="565" width="155" height="175" rx="16" fill="transparent" />
            </g>

            {/* The Phone: Main Progression Gateway */}
            <g
              className={`ws-phone-hit ${phoneClicked ? 'ws-phone-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label="Your phone lit up with a notification on the desk. Click to check it."
              onClick={handlePhoneClick}
              onKeyDown={handlePhoneKey}
              onPointerEnter={() => handleStoryEnter('phone')}
              onPointerLeave={() => handleStoryLeave('phone')}
              style={{
                cursor: phoneClicked ? 'default' : 'pointer',
                outline: 'none',
                pointerEvents: phoneClicked ? 'none' : 'auto'
              }}
            >
              {/* Mathematically calibrated glowing phone screen polygon */}
              <polygon
                points="1437,756 1533,781 1418,852 1311,819"
                fill="#C7F464"
                className="ws-phone-screen-face"
              />
              <ellipse
                cx="1425" cy="802" rx="130" ry="85" transform="rotate(-26 1425 802)"
                fill="url(#wsPhoneGlow)"
                className="ws-phone-glow-svg ws-phone-notified"
              />
              <circle cx="1470" cy="780" r="4.5"
                fill="#C7F464" className="ws-notif-dot" />
              <polygon
                points="1410,720 1550,780 1460,900 1320,840"
                fill="transparent"
              />
            </g>
          </svg>

          {/* 1. Clicked Full Description Card (Shows rich previous description) */}
          {clickedStory && atDesk && !phoneClicked && (
            <div
              className={`ws-story-card ${cardVisible && !isFadingCard ? 'is-visible' : ''} ${isFadingCard ? 'is-fading' : ''}`}
              style={{
                left: `${clickedStory.x}%`,
                top: `${clickedStory.y}%`,
                '--tx': clickedStory.tx || '-50%',
                '--story-accent': clickedStory.accent || '#d4a574'
              }}
              role="dialog"
              aria-modal="false"
            >
              <div className="ws-story-card-header">
                <span className="ws-story-tag">{clickedStory.tag}</span>
                <button
                  className="ws-story-close-btn"
                  onClick={closeStoryCard}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="ws-story-card-text">{clickedStory.text}</div>
              {clickedStory.sub && <div className="ws-story-card-sub">{clickedStory.sub}</div>}
            </div>
          )}

          {/* 2. Hovered Minimal Tooltip Whisper (Only when no card is clicked) */}
          {!clickedStory && hoveredStory && atDesk && !phoneClicked && (
            <div
              className="ws-story-whisper"
              style={{
                left: `${hoveredStory.x}%`,
                top: `${hoveredStory.y}%`,
                '--tx': hoveredStory.tx || '-50%',
                '--story-accent': hoveredStory.accent || '#d4a574'
              }}
              role="status"
              aria-live="polite"
            >
              <span className="ws-story-tag">{hoveredStory.tag}</span>
              <span className="ws-story-dot">·</span>
              <span className="ws-story-text">{hoveredStory.preview}</span>
            </div>
          )}
        </div>

        {/* ── Layer 2: Character (boy in chair with headphones at desk) ──── */}
        <div className="ws-char-layer" aria-hidden="true">
          <img src="/media/ws-char.png" alt="" draggable="false" className="ws-char-img" />
        </div>

        {/* World-level grain + vignette */}
        <div className="ws-world-grain" aria-hidden="true" />
        <div className="ws-world-vignette" aria-hidden="true" />
      </div>

      {/* Editorial caption on the character establishing shot */}
      <p className="ws-caption" aria-live="polite">
        He keeps working. Keeps moving. Keeps not thinking.
      </p>

      {/* Discreet In-World Phone Cue (Replacing the giant capsule button) */}
      {atDesk && !phoneClicked && (
        <button
          className="ws-phone-discreet-cue"
          onClick={handlePhoneClick}
          aria-label="Check your phone"
        >
          <span className="ws-phone-discreet-dot" aria-hidden="true" />
          <span>Check your phone</span>
        </button>
      )}

      {/* Scene-transition overlay */}
      <div className="room-flash" aria-hidden="true" />
    </section>
  );
}
