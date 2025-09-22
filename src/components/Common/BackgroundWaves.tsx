"use client";
import React from "react";

// A decorative, non-intrusive brand background with wavy liquid feel.
// Uses multiple layered SVGs and gradients tinted with the Tailwind 'blue' brand.
// Placed behind content via negative z and pointer-events-none.
const BackgroundWaves: React.FC = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[1] overflow-hidden"
    >
      {/* Top-right blob */}
      <svg
        className="absolute -top-24 right-[-10%] w-[70vw] max-w-[900px] opacity-[0.18] text-blue"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#blur1)">
          <path
            d="M449.9 301.4c0 87.3-89.1 167.6-176.4 167.6S113 388.7 113 301.4 202.1 133.8 289.4 133.8 449.9 214.1 449.9 301.4Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <filter id="blur1" x="0" y="0" width="600" height="600" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
      </svg>

      {/* Bottom-left waves */}
      <svg
        className="absolute -bottom-24 -left-24 w-[90vw] max-w-[1200px] opacity-[0.22]"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1D6F72" />
            <stop offset="100%" stopColor="#5BAEB1" />
          </linearGradient>
        </defs>
        <path
          fill="url(#grad1)"
          d="M0,160L60,181.3C120,203,240,245,360,234.7C480,224,600,160,720,149.3C840,139,960,181,1080,176C1200,171,1320,117,1380,90.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
        <path
          opacity="0.55"
          fill="url(#grad1)"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,197.3C960,192,1056,192,1152,202.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
};

export default BackgroundWaves;
