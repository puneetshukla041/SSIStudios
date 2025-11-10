"use client";

import Image from "next/image";

export default function Logo() {
  return (
    <>
      <style>{`
        .premium-shiny-text {
          position: relative;
          font-weight: 800;
          color: transparent;
          background: linear-gradient(
            90deg,
            #9ca3af 0%,
            #e5e7eb 25%,
            #ffffff 50%,
            #e5e7eb 75%,
            #9ca3af 100%
          );
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.15);
          animation: premium-shine-animation 4s linear infinite;
        }

        @keyframes premium-shine-animation {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>

      <div className="select-none flex items-center justify-center space-x-3 text-[22px] font-sans">
        {/* Logo Image */}
        <Image
          src="/logos/ssilogo.png"
          alt="SSI Studios Logo"
          width={40}
          height={40}
          className="rounded-lg object-contain opacity-95"
          priority
        />

        {/* Shiny Text */}
        <div className="flex space-x-1 items-center">
          <span className="tracking-tight premium-shiny-text">SSI</span>
          <span className="tracking-tight premium-shiny-text">Studios</span>
        </div>
      </div>
    </>
  );
}
