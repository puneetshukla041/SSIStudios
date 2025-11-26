// components/LoadingScreen.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  redirectUrl: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ redirectUrl }) => {
  const [status, setStatus] = useState("Verifying credentials...");

  useEffect(() => {
    // Simple text switch halfway through
    const timer = setTimeout(() => {
      setStatus("Redirecting...");
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    window.location.href = redirectUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-[350px] p-8 text-center"
      >
        {/* Minimal Header */}
        <h2 className="mb-6 text-xl font-medium tracking-tight text-white">
          Accessing Workspace
        </h2>

        {/* Professional Slim Progress Bar */}
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-neutral-800">
          <motion.div
            className="absolute left-0 top-0 h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 1.2, // Fast and snappy
              ease: "easeInOut" 
            }}
            onAnimationComplete={handleComplete}
          />
        </div>

        {/* Animated Text */}
        <div className="mt-4 h-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={status}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-medium uppercase tracking-widest text-neutral-500"
            >
              {status}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;