"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme, CherryBlossomBackground, Theme } from "@/contexts/ThemeContext";

// Icons
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25M21 12h-2.25M12 21v-2.25M3 12h2.25M6.364 6.364l1.591 1.591M17.045 17.045l1.591 1.591M6.364 17.045l1.591-1.591M17.045 6.364l1.591-1.591M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FlowerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a3 3 0 11-6 0 3 3 0 016 0zM18 12a3 3 0 11-6 0 3 3 0 016 0zM12 18a3 3 0 11-6 0 3 3 0 016 0zM18 6a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9.5 14.25a.75.75 0 01-1.154.114l-6-5.5a.75.75 0 111.02-1.102l5.093 4.685 8.541-12.793a.75.75 0 011.04-.208z" clipRule="evenodd" />
  </svg>
);

const ThemePageComponent = () => {
  const { theme, setTheme } = useTheme();
  const [applying, setApplying] = useState(false);

  const themes = [
    { name: "light", label: "Sunrise", icon: <SunIcon />, bgColor: "bg-white", textColor: "text-gray-800" },
    { name: "flower", label: "Blossom", icon: <FlowerIcon />, bgColor: "bg-pink-100", textColor: "text-gray-900" },
  ];

  const applyTheme = (newTheme: Theme) => {
    if (theme === newTheme) return;
    setApplying(true);
    setTheme(newTheme);
    setTimeout(() => setApplying(false), 500);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
      <CherryBlossomBackground />

      {applying && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="w-20 h-20 border-4 border-white rounded-full border-t-transparent animate-spin" />
        </motion.div>
      )}

      <div className="text-center max-w-2xl py-8">
        <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tighter">Customize Your Experience</h1>
        <p className="text-lg md:text-xl font-medium opacity-80">Select a theme that best fits your style.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl py-12">
        {themes.map((t) => (
          <motion.div
            key={t.name}
            className={`relative flex flex-col items-center justify-center p-8 rounded-3xl shadow-2xl cursor-pointer transition-all duration-300
              ${theme === t.name ? "ring-4 ring-blue-500 ring-offset-4 ring-offset-white scale-105" : "hover:scale-105"}
              ${t.bgColor} ${t.textColor}`}
            onClick={() => applyTheme(t.name as Theme)}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-center w-28 h-28 mb-4">{t.icon}</div>
            <h2 className="text-2xl font-bold mb-1">{t.label}</h2>
            <p className="text-sm font-medium opacity-70">{theme === t.name ? "Currently Active" : "Click to Apply"}</p>
            {theme === t.name && (
              <motion.div
                className="absolute top-6 right-6 text-blue-500 bg-white rounded-full p-2 shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <CheckIcon />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ThemePageComponent;
