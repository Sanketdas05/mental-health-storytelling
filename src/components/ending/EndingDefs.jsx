import React from 'react';

export function EndingDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
        </filter>
        <filter id="rough-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
        <filter id="paper-fibres" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="12" result="noise" />
          <feColorMatrix
            type="matrix"
            values="0.32 0 0 0 0.14
                    0 0.24 0 0 0.10
                    0 0 0.18 0 0.06
                    0 0 0 0.05 0"
            result="warmFibre"
          />
          <feBlend mode="multiply" in="SourceGraphic" in2="warmFibre" />
        </filter>
        <linearGradient id="gl" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6ea" />
          <stop offset=".55" stopColor="#f0dcc8" />
          <stop offset="1" stopColor="#d4b496" />
        </linearGradient>
        <radialGradient id="gw">
          <stop offset="0" stopColor="#ffd48a" stopOpacity=".9" />
          <stop offset="1" stopColor="#f2b25c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="footer-arm-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <mask id="footer-light-arm-mask">
          <rect x="-300" y="-400" width="600" height="520" fill="#ffffff" />
          <rect x="-300" y="120" width="600" height="180" fill="url(#footer-arm-fade)" />
          <rect x="-300" y="300" width="600" height="400" fill="#000000" />
        </mask>
        <pattern id="dots" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r=".7" fill="#000" opacity=".28" />
          <circle cx="3.7" cy="3.7" r=".5" fill="#fff" opacity=".22" />
        </pattern>
      </defs>
    </svg>
  );
}


