"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Logo() {
  return (
    <div className="relative z-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="group relative flex cursor-default items-center justify-center gap-3.5 select-none"
      >
        {/* --- Ambient Background Glow (Subtle Blue/White mix) --- */}
        <div className="absolute left-2 top-1/2 h-10 w-20 -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-500/10 blur-2xl transition-all duration-700 group-hover:bg-blue-400/20 group-hover:blur-3xl" />

        {/* --- Logo Image Wrapper with Glass Effect --- */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative z-10"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent shadow-lg backdrop-blur-[2px] transition-all duration-300 group-hover:border-white/20 group-hover:shadow-blue-500/10">
            <Image
              src="/logos/ssilogo.png"
              alt="SSI Studios Logo"
              width={32}
              height={32}
              className="object-contain drop-shadow-md"
              priority
            />
            
            {/* Inner Shine Glare */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </motion.div>

        {/* --- Typography Wrapper --- */}
        <div className="relative z-10 flex flex-col justify-center">
          <div className="flex items-baseline gap-[1px] font-sans text-[22px] leading-none tracking-tight">
            
            {/* "SSI" - Bold Chrome Effect */}
            <span className="relative font-[800] text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 drop-shadow-sm">
              SSI
            </span>

            {/* "Studios" - Elegant Shimmer */}
            <span className="premium-shiny-text ml-1.5 font-[600]">
              Studios
            </span>
          </div>
        </div>

        {/* --- CSS for the infinite metallic shine --- */}
        <style jsx>{`
          .premium-shiny-text {
            color: rgba(255, 255, 255, 0.5); /* Base subtle color */
            background: linear-gradient(
              120deg,
              rgba(255, 255, 255, 0.5) 30%,
              rgba(255, 255, 255, 0.95) 50%,
              rgba(255, 255, 255, 0.5) 70%
            );
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 6s linear infinite;
          }

          @keyframes shine {
            to {
              background-position: 200% center;
            }
          }
        `}</style>
      </motion.div>
    </div>
  );
}