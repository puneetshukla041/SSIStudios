// Sidebar.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion'
import Image from "next/image"
import { Tooltip } from 'react-tooltip'

import Logo from '@/components/aminations/Logo'
import {
  Home,
  FileText,
  Layers,
  Palette,
  Settings,
  BugIcon,
  ChevronDown,
  ChevronRight,
  FileImage,
  LayoutTemplate,
  LogOut,
  Layout,
  RotateCcw,
  Star,
  Folder,
} from 'lucide-react'
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
  requiredAccess?: keyof UserAccess;
}

const menu: MenuItem[] = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  {
    name: 'Bg Remover',
    icon: FileImage,
    path: "/bgremover",
    requiredAccess: 'bgRemover',
  },
  {
    name: 'Image Enhancer',
    icon: Star,
    path: '/imageenhancer',
    requiredAccess: 'imageEnhancer',
  },
  {
    name: 'ID Card Maker',
    icon: LayoutTemplate,
    path: "/idcard",
    requiredAccess: 'idCard',
  },
    {
    name: 'Posters',
    icon: Layout,
    path: "/poster/editor",
    requiredAccess: 'posterEditor',
  },
  
  {
    name: 'Visiting Cards',
    icon: FileText,
    requiredAccess: 'visitingCard',
    children: [
      { name: 'Dark Theme', path: '/selector/visitingcard/dark' },
      { name: 'Light Theme', path: '/selector/visitingcard/light' },
    ],
  },
    {
    name: 'Certificates',
    icon: Layers,
    requiredAccess: 'certificateEditor',
    children: [
      { name: 'Database', path: '/certificates/database' },
     
      { name: 'Analysis', path: '/certificates/analysis' },
    ],
  },

  {
    name: 'Branding Assets',
    icon: Palette,
    requiredAccess: 'assets',
    children: [
      { name: 'Logo Library', path: '/logo' },
    ],
  },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'Theme', path: '/theme' },
      { name: 'Profile & Preferences', path: '/userprofile' },
    ],
  },
    {
    name: 'Report an Bug',
    icon: BugIcon,
    path: "/reportbug",
    requiredAccess: 'idCard',
  },

  { name: 'Logout', icon: LogOut, mobileOnly: true },
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

  // --- Removed all MongoDB Progress Bar State & Controls ---
  
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
      className={`h-screen bg-[#111214] text-white flex flex-col font-nunito border-r-2 border-white/5 shadow-xl transition-all duration-300 ease-in-out relative
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
          const hasAccess = !item.requiredAccess || (user?.access?.[item.requiredAccess] ?? false);
          // A new variable to make the code cleaner.
          const isRestricted = !hasAccess;

          // If the user doesn't have the required access, don't render it
          if (item.mobileOnly && !isMobile) return null

          const Icon = item.icon
          const isOpenMenuItem = expanded.includes(item.name)
          const active = isParentActive(item)

          // Unify the button styling for all states (restricted, active, default).
          const buttonClass = `
            text-white hover:text-white transition-all duration-200
            ${isRestricted ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
            ${active && !isRestricted ? 'font-bold bg-white/10' : 'font-normal hover:bg-white/5'}
            ${item.name === 'Logout' ? 'text-red-500 hover:bg-red-500/10 hover:text-red-400' : ''}
          `;

          return (
            // Updated `div` with motion variant 
            <motion.div key={item.name} className="mb-1.5" variants={menuItemVariants}>
              <button
                onClick={() => {
                  if (isRestricted) return; 
                  if (item.name === 'Logout') {
                    handleLogout();
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
                // Add tooltip attributes here
                data-tooltip-id={`tooltip-${item.name.replace(/\s/g, '-')}`}
                data-tooltip-content="Take permission from admin"
                disabled={isRestricted} // Disable the button.
              >
                <div className="relative flex items-center gap-3 overflow-hidden">
                  <Icon
                    size={18}
                    className={`transition-colors flex-shrink-0 text-white ${isRestricted ? 'opacity-40' : 'opacity-100'}`}
                  />
                  <span
                    className={`text-sm whitespace-nowrap transition-opacity duration-200 ${
                      isMobile || isDesktopHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-opacity duration-300 ${
                    active && !isRestricted ? 'opacity-100 bg-white shadow-glow' : 'opacity-0'
                  }`}
                />
                {item.children &&
                  (isMobile || isDesktopHovered ? (
                    isOpenMenuItem ? (
                      <ChevronDown
                        size={16}
                        className={`text-gray-500 group-hover:text-gray-300 transition-transform duration-200 flex-shrink-0 rotate-180 ${isRestricted ? 'opacity-0' : 'opacity-100'}`}
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className={`text-gray-500 group-hover:text-gray-300 transition-transform duration-200 flex-shrink-0 ${isRestricted ? 'opacity-0' : 'opacity-100'}`}
                      />
                    )
                  ) : null)}
              </button>
              {isRestricted && (
                <Tooltip id={`tooltip-${item.name.replace(/\s/g, '-')}`} className="z-50" />
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
                      ${isRestricted ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
                      ${childIsActive && !isRestricted ? 'font-bold' : 'font-normal hover:bg-white/5'}
                    `;
                    return (
                      <button
                        key={child.path}
                        onClick={() => { 
                          if (isRestricted) return;
                          if (child.path !== pathname) {
                            if (NO_LOADING_ANIMATION_PATHS.has(child.path)) {
                              router.push(child.path);
                            } else {
                              setRedirectUrl(child.path);
                            }
                            if (isOpen) toggleSidebar();
                          }
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 mb-1 ${childButtonClass}`}
                        type="button"
                        data-tooltip-id={`tooltip-${child.path.replace(/\s/g, '-')}`}
                        data-tooltip-content="Take permission from admin"
                        disabled={isRestricted}
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

        {/* --- Removed the entire MongoDB Progress Bar Section from here --- */}

      </motion.nav>

      {/* Footer section is also updated to use motion variant */}
      <motion.div
        className={`p-4 border-t border-gray-800/50 w-full mt-auto hidden lg:block transition-opacity duration-300 ${
          isDesktopHovered ? "opacity-100" : "opacity-0"
        }`}
        variants={isDesktopHovered ? menuItemVariants : undefined}
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
          SSI STUDIOS v.1.08.25
        </div>
        <div className="text-gray-500 text-xs text-center select-none">
          Developed By Puneeet Shukla
        </div>
        <div className="text-green-500 text-xs text-center select-none">
          Beta Version
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors w-full py-2 rounded-lg hover:bg-red-500/10 cursor-pointer mt-3"
          type="button"
        >
          Logout
        </button>
      </motion.div>
    </aside>
  )

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap"
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
        .font-nunito {
          font-family: 'Nunito', sans-serif;
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