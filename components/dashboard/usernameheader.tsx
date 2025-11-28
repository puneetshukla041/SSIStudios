"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';

// --- Professional Typography Configuration ---
const fontHeading = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

const fontBody = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

// Helper to capitalize first letter
function capitalizeFirstLetter(name: string): string {
  if (!name) return "Guest";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Variants for letter animation
const letterVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// Animated SVG character (blinking + waving)
const WavingAnimeCharacter = () => {
  const blinkControls = useAnimation();

  useEffect(() => {
    let mounted = true;

    const blinkLoop = async () => {
      while (mounted) {
        await blinkControls.start({ scaleY: 0.1, transition: { duration: 0.05 } });
        await blinkControls.start({ scaleY: 1, transition: { duration: 0.1 } });
        await new Promise((res) => setTimeout(res, Math.random() * 2000 + 2000));
      }
    };

    blinkLoop();
    return () => {
      mounted = false;
    };
  }, [blinkControls]);

  return (
    <motion.div
      className="absolute h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"
      style={{ top: "-25px", left: "25px" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 8, stiffness: 120, delay: 0.5 }}
      whileHover={{ y: -6, rotate: 5, transition: { type: "spring", stiffness: 500, damping: 12 } }}
    >
      <motion.svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        {/* Headband */}
        <motion.rect x="20" y="28" width="60" height="8" rx="4" fill="#333" />
        <motion.path d="M45,32 C48,30 52,30 55,32" stroke="#fff" strokeWidth="1.5" fill="none" />

        {/* Head and Hair */}
        <motion.path
          d="M50,20 Q60,10 70,20 L65,30 Q60,40 50,35 Q40,40 35,30 L30,20 Q40,10 50,20"
          fill="#f3a745"
        />

        {/* Eyes */}
        <motion.g animate={blinkControls}>
          <motion.circle cx="43" cy="45" r="4" fill="#333" />
          <motion.circle cx="57" cy="45" r="4" fill="#333" />
        </motion.g>

        {/* Mouth */}
        <motion.path d="M45,55 Q50,62 55,55" stroke="#333" strokeWidth="2.5" fill="none" />

        {/* Waving arm */}
        <motion.path
          d="M70,60 C75,55 80,50 75,45"
          stroke="#f3a745"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ rotate: 0 }}
          animate={{
            rotate: [0, 10, -5, 10, 0],
            y: [0, -2, 2, -2, 0],
          }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.9, delay: 1 }}
        />
      </motion.svg>
    </motion.div>
  );
};

export default function UserHeader() {
  const { user } = useAuth();
  const displayName = capitalizeFirstLetter(user?.username || "Guest");
  const nameArray = displayName.split("");
  const [showTooltip, setShowTooltip] = useState(false);

  const todayDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.header
      className={`mb-6 sm:mb-8 px-4 sm:px-6 md:px-0 w-full ${fontBody.className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Title */}
      <motion.h1
        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 leading-tight ${fontHeading.className}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
      >
        <span>Welcome back,</span>
        <span className="relative inline-block ml-2">
          {/* Hide animation on very small screens */}
          <div className="hidden sm:block">
            <WavingAnimeCharacter />
          </div>
          <motion.span
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-700"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {nameArray.map((letter, index) => (
              <motion.span key={index} variants={letterVariants} className="inline-block">
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.span>
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-600 leading-snug max-w-[90%] sm:max-w-full"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
      >
        Ready to create something amazing? Choose from our professional tools and templates.
      </motion.p>

      {/* Bottom Row */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-8 mt-2 sm:mt-3">
        {/* Status Tooltip */}
        <motion.div
          className="relative flex items-center gap-1.5 cursor-pointer"
          onHoverStart={() => setShowTooltip(true)}
          onHoverEnd={() => setShowTooltip(false)}
        >
          <div className="relative flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] sm:text-xs bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600 relative font-medium">
              All systems operational
              <span className="absolute inset-0 w-full h-full overflow-hidden">
                <motion.span
                  className="absolute w-full h-full bg-white/20 transform -skew-x-[45deg]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 2,
                    ease: "linear",
                  }}
                />
              </span>
            </span>
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute left-1/2 -top-6 ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap"
              >
                Software Updated: {todayDate}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Last Login */}
        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-600 leading-snug">
          Last login: Today
        </span>
      </div>
    </motion.header>
  );
}