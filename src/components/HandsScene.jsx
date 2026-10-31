import { useState, useRef, useEffect } from 'react';
import { audioManager } from '../utils/audio';

const COPYABLE_LINES = [
  {
    id: 'talk',
    text: "“I haven't been feeling like myself lately and could really use someone to talk to.”",
    raw: "I haven't been feeling like myself lately and could really use someone to talk to."
  },
  {
    id: 'hangout',
    text: "“I'm having a hard time right now. Can we hang out? No pressure to talk about it.”",
    raw: "I'm having a hard time right now. Can we hang out? No pressure to talk about it."
  },
  {
    id: 'depleted',
    text: "“Work has been consuming everything and I'm running on empty. Just wanted to be honest.”",
    raw: "Work has been consuming everything and I'm running on empty. Just wanted to be honest."
  }
];

const HELPLINES = [
  {
    country: 'United States & Canada',
    number: '988',
    desc: 'Suicide & Crisis Lifeline · Free, 24/7 call or text'
  },
  {
    country: 'United Kingdom',
    number: '111 or Text SHOUT to 85258',
    desc: 'NHS Mental Health Services & 24/7 Crisis Text Line'
  },
  {
    country: 'India',
    number: '14416 or 1800-599-0019',
    desc: 'Tele-MANAS & KIRAN National Mental Health Helplines'
  },
  {
    country: 'International / Worldwide',
    number: 'findahelpline.com',
    desc: 'Free, support services searchable in 130+ countries'
  }
];

const ASK_TWICE_STEPS = [
  {
    num: '01',
    title: 'Acknowledge the reflex',
    desc: '“I know you usually say you’re fine, but you’ve been carrying a lot lately. How are you really doing today?”'
  },
  {
    num: '02',
    title: 'Lower the threshold',
    desc: '“You don’t have to explain anything or be cheerful. We can just sit together or talk about something completely dumb.”'
  },
  {
    num: '03',
    title: 'Follow up three days later',
    desc: 'The second check-in is the one that proves you meant it. A quiet “thinking of you, no need to reply” breaks the silence.'
  }
];

export function HandsScene() {
  const [dragProgress, setDragProgress] = useState(0);
  const [isWarm, setIsWarm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const isDraggingRef = useRef(false);
  const trackRef = useRef(null);

  // Drag interaction logic
  const handleStart = (e) => {
    isDraggingRef.current = true;
    handleMove(e);
  };

  const handleMove = (e) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
    const rawRatio = (clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, rawRatio));
    setDragProgress(clamped);

    if (clamped >= 0.88 && !isWarm) {
      setIsWarm(true);
      audioManager.playWarmWarmthChime();
    }
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (dragProgress >= 0.75) {
      setDragProgress(1);
      setIsWarm(true);
      audioManager.playWarmWarmthChime();
    } else {
      setDragProgress(0);
    }
  };

  useEffect(() => {
    const onTouchMove = (e) => handleMove(e);
    const onTouchEnd = () => handleEnd();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [dragProgress, isWarm]);

  const copyToClipboard = (item) => {
    navigator.clipboard.writeText(item.raw);
    audioManager.playKeyClick();
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Hand physical displacement based on drag progress
  // Left hand moves right (+), Right hand moves left (-)
  const leftX = dragProgress * 52;
  const rightX = -dragProgress * 52;
  const glowOpacity = Math.min(1, dragProgress * 1.35);

  return (
    <section className={`hands-scene scene ${isWarm ? 'is-warm' : ''}`} aria-labelledby="hands-title">
      <div className="hands-stage">
        <p className="eyebrow type-narrator" style={{ marginBottom: 16 }}>THE REACH <span>05</span></p>

        {/* ── Interactive Hands Illustration (Desk Cross-Hatching Ink Style) ── */}
        <div className="interactive-hands-wrap" aria-label="Two hands reaching across the divide. Drag slider to connect.">
          {/* Ambient Warmth Glow Bloom */}
          <div
            className="hands-warmth-glow"
            style={{
              opacity: glowOpacity,
              transform: `translate(-50%, -50%) scale(${0.7 + dragProgress * 0.7})`
            }}
          />

          <svg
            className="hands-svg-canvas"
            viewBox="0 0 800 360"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="handGlowFilter">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Left Hand (Reaching outward from isolation) */}
            <g style={{ transform: `translateX(${leftX}px)`, transition: isDraggingRef.current ? 'none' : 'transform 0.4s ease-out' }}>
              {/* Arm & Wrist */}
              <path className="hand-ink-path" d="M 40,240 C 90,230 150,210 230,195 C 280,185 320,180 375,178" />
              <path className="hand-ink-path" d="M 40,290 C 100,285 160,265 240,240 C 290,225 330,215 365,200" />
              {/* Fingers & Cross-hatching */}
              <path className="hand-ink-path" d="M 375,178 C 395,176 415,175 435,176 C 442,176 448,181 445,187 C 440,194 425,198 405,199" />
              <path className="hand-ink-path" d="M 405,199 C 425,199 440,200 448,206 C 452,211 447,218 438,221 C 418,226 390,223 365,200" />
              {/* Cross-hatching shadow lines */}
              <line className="hand-hatch-line" x1="180" y1="210" x2="195" y2="245" />
              <line className="hand-hatch-line" x1="205" y1="205" x2="220" y2="240" />
              <line className="hand-hatch-line" x1="230" y1="200" x2="245" y2="235" />
              <line className="hand-hatch-line" x1="270" y1="190" x2="285" y2="225" />
              <line className="hand-hatch-line" x1="295" y1="185" x2="310" y2="220" />
              <line className="hand-hatch-line" x1="330" y1="180" x2="345" y2="210" />
            </g>

            {/* Right Hand (Supportive hand reaching inward) */}
            <g style={{ transform: `translateX(${rightX}px)`, transition: isDraggingRef.current ? 'none' : 'transform 0.4s ease-out' }}>
              {/* Arm & Wrist */}
              <path className="hand-ink-path" d="M 760,140 C 710,150 650,170 570,185 C 520,195 480,200 425,202" />
              <path className="hand-ink-path" d="M 760,90 C 700,95 640,115 560,140 C 510,155 470,165 435,180" />
              {/* Fingers & Palm */}
              <path className="hand-ink-path" d="M 425,202 C 405,204 385,205 365,204 C 358,204 352,199 355,193 C 360,186 375,182 395,181" />
              <path className="hand-ink-path" d="M 395,181 C 375,181 360,180 352,174 C 348,169 353,162 362,159 C 382,154 410,157 435,180" />
              {/* Cross-hatching shadow lines */}
              <line className="hand-hatch-line" x1="620" y1="170" x2="605" y2="135" />
              <line className="hand-hatch-line" x1="595" y1="175" x2="580" y2="140" />
              <line className="hand-hatch-line" x1="570" y1="180" x2="555" y2="145" />
              <line className="hand-hatch-line" x1="530" y1="190" x2="515" y2="155" />
              <line className="hand-hatch-line" x1="505" y1="195" x2="490" y2="160" />
              <line className="hand-hatch-line" x1="470" y1="200" x2="455" y2="170" />
            </g>

            {/* Amber Warmth Spark Center */}
            {dragProgress > 0.4 && (
              <circle
                cx="400"
                cy="190"
                r={16 * dragProgress}
                fill="#E29338"
                opacity={glowOpacity * 0.85}
                filter="url(#handGlowFilter)"
              />
            )}
          </svg>
        </div>

        {/* ── Drag Control Slider ── */}
        <div className="hands-drag-control">
          <span className="hands-drag-cue type-narrator">
            {isWarm ? 'CONNECTION MADE · WARMTH RESTORED' : 'DRAG TO REACH OUT'}
          </span>
          <div
            ref={trackRef}
            className="hands-slider-track"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            role="slider"
            aria-valuenow={Math.round(dragProgress * 100)}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Drag the slider to connect the two hands"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                setDragProgress((p) => {
                  const next = Math.min(1, p + 0.25);
                  if (next >= 0.85) { setIsWarm(true); audioManager.playWarmWarmthChime(); }
                  return next;
                });
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                setDragProgress((p) => Math.max(0, p - 0.25));
              }
            }}
          >
            <div
              className="hands-slider-thumb"
              style={{
                transform: `translateX(${dragProgress * 214}px)`
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Main Supportive Statement ── */}
        <div className="hands-story-header">
          <h2 id="hands-title" className="hands-main-title">
            <span className="type-speech">It’s okay to</span>{' '}
            <em className="type-thought" style={{ color: 'var(--story-amber)', fontStyle: 'normal' }}>
              ask for help.
            </em>
          </h2>
          <p className="hands-sub-quote type-speech">
            “You don’t have to carry this alone.”
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ENDING ELEVATIONS: THE NOTE, COPYABLE CARDS, HELPLINES, ASK TWICE
            ══════════════════════════════════════════════════════════════════ */}
        <div className={`ending-guide-wrap ${isWarm ? 'is-visible' : ''}`}>
          {/* 1. The Personal Note (from one creative to another) */}
          <div className="the-personal-note">
            <p className="type-narrator note-tag">FROM ONE CREATIVE TO ANOTHER</p>
            <p>
              We spend so much of our lives polishing the work, managing impressions, and making sure nobody
              hears the fatigue in our voices. It feels easier to type <em>“I’m fine :)”</em> than to burden
              someone with the honest, tangled truth.
            </p>
            <p>
              Carrying everything alone in the dark isn't strength—it’s just exhaustion with good posture.
              If anything on this desk felt painfully familiar, please give yourself permission to stop performing.
              The people who care about you don’t need you to be smooth and unshakeable; they just need you here.
            </p>
            <p className="note-signature">
              — A quiet note for anyone working past midnight
            </p>
          </div>

          {/* 2. Copyable "What to say" cards */}
          <section className="guide-section" aria-labelledby="say-title">
            <h3 id="say-title" className="guide-heading type-narrator">
              IF YOU DON’T KNOW WHAT TO SAY · CLICK TO COPY
            </h3>
            <div className="copyable-grid">
              {COPYABLE_LINES.map((item) => (
                <button
                  key={item.id}
                  className="copyable-card"
                  onClick={() => copyToClipboard(item)}
                  aria-label={`Copy to clipboard: ${item.raw}`}
                >
                  <span className="copyable-text type-speech">{item.text}</span>
                  <span className="copyable-action type-thought">
                    {copiedId === item.id ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        COPIED TO CLIPBOARD
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        CLICK TO COPY LINE
                      </>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 3. For Friends: How to Ask Twice */}
          <section className="guide-section" aria-labelledby="friends-title">
            <h3 id="friends-title" className="guide-heading type-narrator">
              FOR FRIENDS · IF SOMEONE TELLS YOU THEY’RE FINE
            </h3>
            <ol className="ask-twice-steps">
              {ASK_TWICE_STEPS.map((step) => (
                <li key={step.num} className="ask-step-item">
                  <div className="ask-step-num type-thought">{step.num}</div>
                  <h4 className="ask-step-title type-narrator">{step.title}</h4>
                  <p className="ask-step-desc">{step.desc}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* 4. Helplines by Country */}
          <section className="guide-section" aria-labelledby="helplines-title">
            <h3 id="helplines-title" className="guide-heading type-narrator">
              HELPLINES · AVAILABLE 24/7
            </h3>
            <div className="helplines-grid">
              {HELPLINES.map((hl) => (
                <div key={hl.country} className="helpline-box">
                  <div className="helpline-country type-narrator">{hl.country}</div>
                  <div className="helpline-number type-thought">{hl.number}</div>
                  <div className="helpline-desc">{hl.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
