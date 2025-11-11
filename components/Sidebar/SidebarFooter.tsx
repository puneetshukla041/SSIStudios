// src/components/Sidebar/SidebarFooter.tsx
import { motion, Variants } from 'framer-motion';
import { LogOut } from 'lucide-react';

type SidebarFooterProps = {
  isDesktopHovered: boolean;
  handleLogout: () => void;
  variants: Variants;
};

export default function SidebarFooter({ isDesktopHovered, handleLogout, variants }: SidebarFooterProps) {
  if (!isDesktopHovered) {
    // Return a minimal, collapsed footer if not hovered, matching the original structure
    return (
      <div className="p-4 border-t border-gray-800/50 w-full mt-auto hidden lg:block transition-opacity duration-300 opacity-0">
        {/* Placeholder for layout stability */}
        <div className="text-gray-500 text-xs text-center select-none h-20" />
      </div>
    );
  }

  return (
    <motion.div
      className={`p-4 border-t border-gray-800/50 w-full mt-auto hidden lg:block transition-opacity duration-300 opacity-100`}
      variants={variants}
      initial="hidden"
      animate="show"
    >
      {/* Download Android App Button */}
      <a
        href="https://drive.google.com/file/d/1AgSWuLtwlhmCxMTsDuHLxvmA8MuKDbTL/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full mb-3 flex items-center justify-center gap-2 rounded-lg
          bg-gradient-to-r from-green-600 via-green-700 to-green-800
          hover:from-green-500 hover:via-green-600 hover:to-green-700
          text-white font-medium text-sm py-2.5
          shadow-md shadow-black/30 backdrop-blur-md
          transition-all cursor-pointer active:scale-[0.97]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8 0 0 1-8 8Zm-1-13h2v6h-2Zm0 8h2v2h-2Z"/>
        </svg>
        Download Android App
      </a>

      {/* Download Desktop App Button */}
      <a
        href="https://drive.google.com/uc?export=download&id=1wsR2aYD_iW_dFCKuP-f2IwOusziUHQiK"
        download
        className="w-full mb-3 flex items-center justify-center gap-2 rounded-lg
          bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900
          hover:from-gray-600 hover:via-gray-700 hover:to-gray-800
          text-gray-200 font-medium text-sm py-2.5
          shadow-md shadow-black/30 backdrop-blur-md
          transition-all cursor-pointer active:scale-[0.97]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
        Download Desktop App
      </a>
      <div className="text-gray-500 text-xs text-center select-none">
        SSI STUDIOS v.1.11.25
      </div>
      <div className="text-gray-500 text-xs text-center select-none">
        Developed By Creative Operations
      </div>
      <div className="text-green-500 text-xs text-center select-none">
        Beta Version
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors w-full py-2 rounded-lg hover:bg-red-500/10 cursor-pointer mt-3"
        type="button"
      >
        <LogOut size={16} />
        Logout
      </button>
    </motion.div>
  );
}