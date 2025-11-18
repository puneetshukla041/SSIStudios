// components/LoadingScreen.tsx
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Zap } from 'lucide-react'; // Added a subtle icon

interface LoadingScreenProps {
  redirectUrl: string;
}

const lines = [
  "connecting...",
  "connected",
];

// Set a clear, consistent duration for all animations
const TOTAL_DURATION_MS = 2000; 

const LoadingScreen: React.FC<LoadingScreenProps> = ({ redirectUrl }) => {
  // 1. Use useMotionValue to control the width property smoothly
  const progressBarWidth = useMotionValue(0);
  // Use useTransform to convert the 0-100 number to a CSS width string
  const progressCSS = useTransform(progressBarWidth, (p) => `${p}%`);
  
  const [displayLine, setDisplayLine] = useState(lines[0]);

  useEffect(() => {
    // 2. Animate the MotionValue directly over the TOTAL_DURATION
    const progressControl = animate(progressBarWidth, 100, {
      duration: TOTAL_DURATION_MS / 1000, // Duration in seconds
      ease: "easeInOut", // Smoother start and end
      onComplete: () => {
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 300);
      }
    });

    // 3. Line Animation Synchronization
    const lineDuration = TOTAL_DURATION_MS / lines.length;
    let index = 0;

    const lineInterval = setInterval(() => {
      index++;
      if (index < lines.length) setDisplayLine(lines[index]);
      else clearInterval(lineInterval);
    }, lineDuration);

    // Cleanup function
    return () => {
      progressControl.stop();
      clearInterval(lineInterval);
    };
  }, [redirectUrl, progressBarWidth]);

  // Framer-motion variants for the line text
  const textVariants = {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -10, opacity: 0 },
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-80 p-8 rounded-3xl bg-neutral-900/95 border border-blue-400/30 shadow-2xl shadow-blue-500/20 backdrop-blur-lg text-center"
      >
        <Zap className="w-6 h-6 mx-auto mb-3 text-blue-500/80" />
        
        <h2 className="text-xl text-white font-extrabold mb-5 tracking-wide">
          Preparing Your Workspace
        </h2>

        {/* Progress Bar Container */}
        <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden mb-5">
          <motion.div
            className="h-full bg-blue-500 shadow-md shadow-blue-500/50"
            // KEY CHANGE: Use the useTransform output here!
            style={{ width: progressCSS }} 
            // Removed transition prop, letting framer-motion's `animate` control the duration
          />
        </div>

        {/* Dynamic Status Text */}
        <div className="mt-4 text-sm text-gray-400 h-6 overflow-hidden">
          <motion.p
            key={displayLine}
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
          >
            {displayLine}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;