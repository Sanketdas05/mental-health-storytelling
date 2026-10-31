import { useState, useEffect } from 'react';
import { audioManager } from '../utils/audio';

export const CHAPTERS = [
  { id: '00', title: 'The Smile', cue: 'Intro & CRT monitor', targetProg: 0.00 },
  { id: '01', title: 'The Distraction', cue: 'Late-night workstation', targetProg: 0.22 },
  { id: '02', title: 'The Message', cue: 'Phone conversation', targetProg: 0.44 },
  { id: '03', title: 'The Noise', cue: 'Racing inner thoughts', targetProg: 0.58 },
  { id: '04', title: 'The Weight', cue: 'The ASCII mind matrix', targetProg: 0.74 },
  { id: '05', title: 'The Reach', cue: 'Supportive hands & guide', targetProg: 0.94 }
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



    </>
  );
}
