import React from 'react';

export function EndingFooter({ ftrRef, fhRef, topRef }) {
  return (
    <footer id="ftr" ref={ftrRef}>
      {/* Paper fibres and ink smudges */}
      <div className="paper-fibres-overlay" aria-hidden="true" />
      <div className="ink-smudge footer-smudge-1" aria-hidden="true" />

      <div className="ft">
        <div>
          <div className="brand">I’m fine.</div>
          <p>
            A small story about the smile that hides the weight, and the one brave sentence that comes after. If it felt familiar, you’re not the only one.
          </p>
        </div>
        <ul className="fl">
          <li><a href="tel:14416" aria-label="Call Tele-MANAS 14416">Tele-MANAS · 14416</a></li>
          <li><a href="tel:988" aria-label="Call 988 US and Canada">988 · US &amp; Canada</a></li>
          <li><a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" aria-label="Visit findahelpline.com">findahelpline.com</a></li>
          <li><a href="#top" id="top" ref={topRef} aria-label="Scroll back to the start">Back to the start ↑</a></li>
        </ul>
      </div>
      <div className="fi" id="fi">
        <span className="sp" style={{ left: '30%', bottom: '62%' }}></span>
        <span className="sp" style={{ left: '36%', bottom: '78%', animationDelay: '-1.5s' }}></span>
        <span className="sp" style={{ left: '64%', bottom: '70%', animationDelay: '-3s' }}></span>
        <span className="sp" style={{ left: '70%', bottom: '50%', animationDelay: '-2s' }}></span>
        <svg viewBox="0 0 1000 420" id="fsv" aria-hidden="true" style={{ overflow: 'visible' }}>
          <g fill="none" stroke="#e0913c" strokeOpacity=".7" strokeWidth="1.2">
            <circle cx="500" cy="430" r="420" />
            <circle cx="500" cy="430" r="320" />
            <circle cx="500" cy="430" r="220" />
          </g>
          <g filter="url(#ink)" id="fh" ref={fhRef}></g>
        </svg>
      </div>
      <div className="fb">
        <span>© 2026 · I’m fine.</span>
        <span>Made for anyone who has ever said it</span>
      </div>
    </footer>
  );
}


