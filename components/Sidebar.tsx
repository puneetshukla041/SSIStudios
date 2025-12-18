'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import Image from "next/image"
import { Tooltip } from 'react-tooltip'

import Logo from '@/components/aminations/Logo'

// Importing Lucide Icons (Clean, rounded, modern)
import {
  LuLayoutDashboard, // Dashboard
  LuAward,           // Certificates
  LuEraser,          // Bg Remover
  LuContact,         // Visiting Cards
  LuWand,           // Image Enhancer
  LuIdCard,         // ID Card
  LuLayoutTemplate,  // Posters
  LuPalette,         // Branding
  LuSettings,        // Settings
  LuBug,             // Bug Report
  LuLogOut,          // Logout
  LuChevronDown,
  LuChevronRight,
  LuSmartphone,      // Android
  LuMonitor,         // Desktop
  LuGitBranch,       // Versions
  LuCode,           // Developer Icon
} from 'react-icons/lu'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import LoadingScreen from '@/components/aminations/LoadingScreen'

// Import the UserAccess interface to use for strong typing
import type { UserAccess } from '@/contexts/AuthContext';

// --- Menu Data ---
type MenuItem = {
  name: string
  icon: React.ElementType
  path?: string
  children?: { name: string; path: string }[]
  onClick?: () => void
  mobileOnly?: boolean
  // FIX: Allow string to support keys not yet added to UserAccess interface (fixes build error)
  requiredAccess?: keyof UserAccess | string; 
  isUnderDevelopment?: boolean;
}

const menu: MenuItem[] = [
  { 
    name: 'Dashboard', 
    icon: LuLayoutDashboard, 
    path: '/dashboard',
    requiredAccess: 'dashboard' // Now controlled by DB
  },

  {
    name: 'Certificates',
    icon: LuAward,
    requiredAccess: 'certificateEditor',
    children: [
      { name: 'Database', path: '/certificates/database' },
      { name: 'Analysis', path: '/certificates/analysis' },
    ],
  },
  {
    name: 'Bg Remover',
    icon: LuEraser,
    path: "/bgremover",
    requiredAccess: 'bgRemover',
  },
  {
    name: 'Visiting Cards',
    icon: LuContact,
    path: "/visitingcards",
    requiredAccess: 'visitingCard', // Fixed key name to match DB
  },

  {
    name: 'Image Enhancer',
    icon: LuWand,
    path: '/imageenhancer',
    requiredAccess: 'imageEnhancer', // Added access control
    isUnderDevelopment: true,
  },
  {
    name: 'ID Card Maker',
    icon: LuIdCard,
    path: "/idcard",
    requiredAccess: 'idCard',
  },
  {
    name: 'Posters',
    icon: LuLayoutTemplate,
    path: "/poster",
    requiredAccess: 'posterEditor',
  },
  
  {
    name: 'Branding Assets',
    icon: LuPalette,
    requiredAccess: 'assets',
    isUnderDevelopment: true,
    children: [
      { name: 'Logo Library', path: '/logo' },
    ],
  },
  {
    name: 'Settings',
    icon: LuSettings,
    requiredAccess: 'settings', // Now controlled by DB
    children: [
      { name: 'Theme', path: '/theme' },
      { name: 'Profile & Preferences', path: '/userprofile' },
    ],
  },
  {
    name: 'Report a Bug',
    icon: LuBug,
    path: "/reportbug",
    requiredAccess: 'bugReport', // Now controlled by DB
  },
  //{
   //name: 'Developer',
    //icon: LuCode, 
   /// path: "https://puneetportfolio.vercel.app/content",
  //  requiredAccess: 'developer', // Now controlled by DB
 // },
//
  { name: 'Logout', icon: LuLogOut, mobileOnly: true },
]

// Define the menu items that should NOT show the loading animation
const NO_LOADING_ANIMATION_PATHS = new Set([
  '/dashboard',
  '/logo',
  '/theme',
  '/userprofile',
]);

// --- Animation Variants for Staggered Menu Items ---
const menuContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const menuItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// --- Sidebar Component ---
type SidebarProps = {
  forceActive?: string
  isOpen: boolean
  toggleSidebar: () => void
}

export default function Sidebar({ forceActive, isOpen, toggleSidebar }: SidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState(false)

  // State to manage redirection and loading
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Control body overflow on sidebar open/close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  useEffect(() => {
    const expandedParents = menu
      .filter(
        (item) =>
          item.children && item.children.some((child) => pathname.startsWith(child.path))
      )
      .map((item) => item.name)
    setExpanded(expandedParents)
  }, [pathname])

  const toggle = (name: string) =>
    setExpanded((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))

  const isParentActive = (item: MenuItem) => {
    if (forceActive) return item.name === forceActive
    if (item.path && pathname.startsWith(item.path)) return true
    if (item.children) return item.children.some((c) => pathname.startsWith(c.path))
    return false
  }

  const isChildActive = (path: string) => pathname.startsWith(path)

  const handleLogout = () => logout()

  const renderSidebarContent = (isMobile: boolean, isDesktopHovered = false) => (
    <aside
      className={`h-screen bg-[#111214] text-white flex flex-col font-quicksand border-r-2 border-white/5 shadow-xl transition-all duration-300 ease-in-out relative
        ${isMobile ? 'w-[85%] max-w-sm' : isDesktopHovered ? 'w-64' : 'w-20'}
      `}
    >
      <div className="p-5 h-[72px] border-b border-gray-800/50 flex items-center justify-between overflow-hidden">
        <div className="flex items-center justify-center w-full relative">
          {/* Full Logo */}
          <div
            className={`absolute transition-all duration-300 ${
              isMobile || isDesktopHovered
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <Logo />
          </div>

          {/* Compact Icon Logo */}
          <div
            className={`absolute transition-all duration-300 ${
              !isMobile && !isDesktopHovered
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <Image
              src="/logos/ssilogo.png"
              alt="SSI Logo"
              width={32}
              height={32}
              className="transition-all duration-300"
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Updated `nav` element for animations */}
      <motion.nav
        className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar"
        variants={menuContainerVariants}
        initial="hidden"
        animate="show"
      >
        {menu.map((item) => {
          // This is the access check logic.
          // FIX: Cast user.access to 'any' to allow indexing by dynamic strings (dashboard)
          const hasAccess = !item.requiredAccess || ((user?.access as any)?.[item.requiredAccess] ?? false);
          
          // Special check: Developer button is always visible
          const isRestricted = !hasAccess && item.name !== 'Developer';
          
          // Check for development status
          const isDeveloping = item.isUnderDevelopment || isRestricted; 
          const tooltipContent = item.isUnderDevelopment ? "Feature under development" : "Take permission from admin";


          // If the user doesn't have the required access, don't render it
          if (item.mobileOnly && !isMobile) return null

          const Icon = item.icon
          const isOpenMenuItem = expanded.includes(item.name)
          const active = isParentActive(item)

          // Unify the button styling for all states (restricted, active, default, developing).
          // CHANGED: Used font-medium for active, font-normal for inactive. Removed heavy bolding.
          const buttonClass = `
            text-white hover:text-white transition-all duration-200
            ${isDeveloping ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
            ${active && !isDeveloping ? 'font-semibold bg-white/10' : 'font-medium hover:bg-white/5'}
            ${item.name === 'Logout' ? 'text-red-500 hover:bg-red-500/10 hover:text-red-400' : ''}
            ${item.name === 'Developer' ? 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300' : ''} 
          `;

          return (
            <motion.div key={item.name} className="mb-1.5" variants={menuItemVariants}>
              <button
                onClick={() => {
                  if (isDeveloping) return;
                  
                  if (item.name === 'Logout') {
                    handleLogout();
                    return;
                  }

                  // --- EXTERNAL LINK HANDLING ---
                  if (item.path && item.path.startsWith('http')) {
                    window.open(item.path, '_blank');
                    return;
                  }

                  if (item.children) {
                    toggle(item.name);
                  } else if (item.path && item.path !== pathname) {
                    // Check if the current item should have a loading animation
                    if (NO_LOADING_ANIMATION_PATHS.has(item.path)) {
                      router.push(item.path);
                    } else {
                      setRedirectUrl(item.path);
                    }
                    if (isOpen) toggleSidebar();
                  }
                }}
                className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 relative ${buttonClass}`}
                type="button"
                data-tooltip-id={`tooltip-${item.name.replace(/\s/g, '-')}`}
                data-tooltip-content={tooltipContent}
                disabled={isDeveloping}
              >
                <div className="relative flex items-center gap-3 overflow-hidden">
                  <Icon
                    size={20} // Slightly smaller size looks more elegant with these icons
                    strokeWidth={2} // Ensures they aren't too bold
                    className={`transition-colors flex-shrink-0 ${item.name === 'Developer' ? 'text-indigo-400' : 'text-white'} ${isDeveloping ? 'opacity-40' : 'opacity-100'}`}
                  />
                  <span
                    className={`text-[14px] whitespace-nowrap transition-opacity duration-200 ${
                      isMobile || isDesktopHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-opacity duration-300 ${
                    active && !isDeveloping ? 'opacity-100 bg-white shadow-glow' : 'opacity-0'
                  }`}
                />
                {item.children &&
                  (isMobile || isDesktopHovered ? (
                    isOpenMenuItem ? (
                      <LuChevronDown
                        size={16}
                        className={`text-gray-500 group-hover:text-gray-300 transition-transform duration-200 flex-shrink-0 ${isDeveloping ? 'opacity-0' : 'opacity-100'}`}
                      />
                    ) : (
                      <LuChevronRight
                        size={16}
                        className={`text-gray-500 group-hover:text-gray-300 transition-transform duration-200 flex-shrink-0 ${isDeveloping ? 'opacity-0' : 'opacity-100'}`}
                      />
                    )
                  ) : null)}
              </button>
              {isDeveloping && (
                <Tooltip id={`tooltip-${item.name.replace(/\s/g, '-')}`} className="z-50 font-quicksand" />
              )}
              {item.children && (
                <motion.div
                  initial={false}
                  animate={{ height: isOpenMenuItem ? 'auto' : 0, opacity: isOpenMenuItem ? 1 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
                  className="ml-5 border-l border-gray-700 pl-4 overflow-hidden mt-2"
                >
                  {item.children.map((child) => {
                    const childIsActive = isChildActive(child.path)
                    const childButtonClass = `
                      text-white transition-all duration-200
                      ${isDeveloping ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
                      ${childIsActive && !isDeveloping ? 'font-semibold text-white' : 'font-medium text-gray-300 hover:text-white hover:bg-white/5'}
                    `;
                    return (
                      <button
                        key={child.path}
                        onClick={() => { 
                          if (isDeveloping) return;
                          if (child.path !== pathname) {
                            if (NO_LOADING_ANIMATION_PATHS.has(child.path)) {
                              router.push(child.path);
                            } else {
                              setRedirectUrl(child.path);
                            }
                            if (isOpen) toggleSidebar();
                          }
                        }}
                        className={`block w-full text-left px-3 py-2 text-[13px] rounded-md transition-colors duration-200 mb-1 ${childButtonClass}`}
                        type="button"
                        data-tooltip-id={`tooltip-${child.path.replace(/\s/g, '-')}`}
                        data-tooltip-content={tooltipContent}
                        disabled={isDeveloping}
                      >
                        {child.name}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </motion.nav>

      {/* --- PROFESSIONAL FOOTER SECTION --- */}
      <motion.div
        className={`px-4 py-4 border-t border-white/5 w-full mt-auto hidden lg:flex flex-col gap-4 transition-opacity duration-300 ${
          isDesktopHovered ? "opacity-100" : "opacity-0"
        }`}
        variants={isDesktopHovered ? menuItemVariants : undefined}
      >
        {/* Ecosystem Downloads */}
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
            Ecosystem
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Android */}
            <a
              href="https://drive.google.com/file/d/1AgSWuLtwlhmCxMTsDuHLxvmA8MuKDbTL/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-green-500/20 transition-all cursor-pointer"
            >
              <LuSmartphone size={18} className="text-gray-400 group-hover:text-green-500 transition-colors mb-1.5" />
              <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-200">Android</span>
            </a>

            {/* Desktop */}
            <a
              href="https://drive.google.com/uc?export=download&id=1wsR2aYD_iW_dFCKuP-f2IwOusziUHQiK"
              download
              className="group flex flex-col items-center justify-center p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/20 transition-all cursor-pointer"
            >
              <LuMonitor size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors mb-1.5" />
              <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-200">Desktop</span>
            </a>
          </div>
        </div>

        {/* System Info & Credits - HIGHLIGHTED SECTION */}
        <div className="space-y-2 px-1 pt-1">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
             <div className="flex items-center gap-2 group">
               <LuGitBranch size={12} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
               
               {/* Version: Monospaced, matte gray, no glow */}
               <span className="font-mono text-gray-500 group-hover:text-gray-300 transition-colors">
                 v.1.08.25
               </span>
             </div>
             
             {/* BETA Tag: Flat, bordered, muted emerald (Professional style) */}
             <span className="border border-emerald-900/30 bg-emerald-900/10 text-emerald-600 px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold tracking-wider opacity-80">
               BETA
             </span>
          </div>
          
          {/* Replaced Text with Professional Styling */}
          <div className="flex items-center justify-center pt-2">
             <span className="text-[10px] font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-200 to-gray-500 uppercase hover:from-white hover:to-white transition-all duration-500">
               A SSI APPLICATION
             </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/5" />
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 px-1 py-1 text-xs font-medium text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            type="button"
          >
            <div className="flex items-center justify-center h-7 w-7 rounded-md bg-white/5 group-hover:bg-red-500/10 transition-colors text-inherit ">
              <LuLogOut size={14} />
            </div>
            <span>Sign Out</span>
          </button>
        </div>

        
      </motion.div>
    </aside>
  )

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Changed to Quicksand - much cuter, lighter, and cleaner than Fredoka */}
      <link
        href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Desktop Sidebar */}
      <div
        className="hidden lg:block fixed top-0 left-0 h-screen z-30"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {renderSidebarContent(false, isHovered)}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
            aria-hidden={!isOpen}
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={toggleSidebar}
              aria-label="Close sidebar overlay"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 250, damping: 35 }}
              className="relative w-[85%] max-w-sm h-full"
            >
              {renderSidebarContent(true)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render the loading screen if redirectUrl is set */}
      <AnimatePresence>
        {redirectUrl && (
          <LoadingScreen redirectUrl={redirectUrl} />
        )}
      </AnimatePresence>

      <style>{`
        .font-quicksand {
          font-family: 'Quicksand', sans-serif;
        }
        .shadow-glow {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}