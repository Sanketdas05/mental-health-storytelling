import { useState, useEffect } from 'react';
import { audioManager } from '../utils/audio';

export const CHAPTERS = [
  { id: '00', title: 'The Smile',       cue: 'Intro & CRT monitor',      targetProg: 0.00 },
  { id: '01', title: 'The Distraction', cue: 'Late-night workstation',   targetProg: 0.22 },
  { id: '02', title: 'The Message',     cue: 'Phone conversation',       targetProg: 0.44 },
  { id: '03', title: 'The Noise',       cue: 'Racing inner thoughts',    targetProg: 0.58 },
  { id: '04', title: 'The Weight',      cue: 'The ASCII mind matrix',    targetProg: 0.74 },
  { id: '05', title: 'The Reach',       cue: 'Supportive hands & guide', targetProg: 0.94 }
];

export function ChapterNav({ progress, soundEnabled, onToggleSound }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Determine current active chapter based on overall scroll progress
  useEffect(() => {
    let curr = 0;
    if (progress >= 0.88) curr = 5;
    else if (progress >= 0.68) curr = 4;
    else if (progress >= 0.52) curr = 3;
    else if (progress >= 0.38) curr = 2;
    else if (progress >= 0.16) curr = 1;
    else curr = 0;
    setActiveIdx(curr);
  }, [progress]);

  const jumpToChapter = (chapter) => {
    setIsOpen(false);
    audioManager.playKeyClick();
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = chapter.targetProg * docHeight;

    if (window.__lenis) {
      window.__lenis.scrollTo(targetScroll, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  const activeChapter = CHAPTERS[activeIdx];

  return (
    <>
      {/* ── Top Atmospheric Navigation Bar ── */}
      <header className="chapter-bar" role="banner">
        {/* Left: Chapter Selector Trigger */}
        <button
          className="chapter-indicator-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={`Current chapter: ${activeChapter.id} ${activeChapter.title}. Click to view chapter menu.`}
        >
          <span className="chapter-num type-thought">{activeChapter.id}/05</span>
          <span className="chapter-divider">·</span>
          <span className="chapter-name type-narrator">{activeChapter.title}</span>
          <svg className={`chapter-chevron ${isOpen ? 'is-open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Center: Looping Ticker Marquee */}
        <div className="chapter-marquee-wrap" aria-hidden="true">
          <div className="chapter-marquee-inner">
            <span className="type-speech marquee-text">“I’m fine”</span>
            <span className="marquee-sep">·</span>
            <span className="type-speech marquee-text">“all good :)”</span>
            <span className="marquee-sep">·</span>
            <span className="type-speech marquee-text">“just tired”</span>
            <span className="marquee-sep">·</span>
            <span className="type-speech marquee-text">“busy lately”</span>
            <span className="marquee-sep">·</span>
            <span className="type-speech marquee-text">“can’t complain”</span>
            <span className="marquee-sep">·</span>
            <span className="type-speech marquee-text">“almost done”</span>
            <span className="marquee-sep">·</span>
            <span className="type-speech marquee-text">“I’m fine”</span>
            <span className="marquee-sep">·</span>
            <span className="type-speech marquee-text">“all good :)”</span>
            <span className="marquee-sep">·</span>
            <span className="type-speech marquee-text">“just tired”</span>
            <span className="marquee-sep">·</span>
            <span className="type-speech marquee-text">“busy lately”</span>
            <span className="marquee-sep">·</span>
          </div>
        </div>

        {/* Right: Audio Toggle & Story Status */}
        <div className="chapter-controls">
          <button
            className={`chapter-sound-btn ${soundEnabled ? 'is-active' : ''}`}
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute ambient soundscape' : 'Enable ambient soundscape'}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            <span className="sound-pulse-dot" />
            <span className="type-thought sound-label">{soundEnabled ? 'SOUND ON' : 'MUTED'}</span>
          </button>
        </div>
      </header>

      {/* ── Chapter Dropdown Modal Overlay ── */}
      {isOpen && (
        <div className="chapter-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="chapter-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="chapter-modal-header">
              <span className="type-narrator modal-subtitle">INDEX / TABLE OF DESCENT</span>
              <button
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chapter index"
              >
                ✕
              </button>
            </div>
            <ul className="chapter-list">
              {CHAPTERS.map((ch, idx) => {
                const isCurrent = idx === activeIdx;
                return (
                  <li key={ch.id}>
                    <button
                      className={`chapter-item-btn ${isCurrent ? 'is-active' : ''}`}
                      onClick={() => jumpToChapter(ch)}
                    >
                      <span className="chapter-item-num type-thought">{ch.id}</span>
                      <div className="chapter-item-info">
                        <span className="chapter-item-title type-narrator">{ch.title}</span>
                        <span className="chapter-item-cue">{ch.cue}</span>
                      </div>
                      {isCurrent && <span className="chapter-item-indicator type-thought">CURRENT</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
