// components/LoadingScreen.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  redirectUrl: string;
}

const lines = [
  "connecting...",
  "connected",
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ redirectUrl }) => {
  const [progress, setProgress] = useState(0);
  const [displayLine, setDisplayLine] = useState(lines[0]);

  useEffect(() => {
    // Smooth progress bar over 4 seconds
    const progressStart = performance.now();
    const progressDuration = 1000; // 4 seconds

    const progressAnimation = (timestamp: number) => {
      const elapsed = timestamp - progressStart;
      const percentage = Math.min((elapsed / progressDuration) * 100, 100);
      setProgress(percentage);

      if (percentage < 100) {
        requestAnimationFrame(progressAnimation);
      } else {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 300);
      }
    };

    requestAnimationFrame(progressAnimation);

    // Animate lines one by one
    let index = 0;
    const lineInterval = setInterval(() => {
      index++;
      if (index < lines.length) setDisplayLine(lines[index]);
      else clearInterval(lineInterval);
    }, 400); // 1.3s per line

    return () => clearInterval(lineInterval);
  }, [redirectUrl]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center transition-opacity duration-700">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-80 p-6 rounded-2xl bg-neutral-900/80 border border-white/20 shadow-2xl backdrop-blur-md text-center"
      >
        <h2 className="text-xl text-white font-bold mb-4 tracking-wide">
          Preparing Your Workspace
        </h2>
        <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        <div className="mt-4 text-sm text-gray-400 h-6">
          <motion.p
            key={displayLine}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {displayLine}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;