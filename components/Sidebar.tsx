// src/components/Sidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import Image from "next/image"
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// Import modular components and data
import Logo from '@/components/aminations/Logo' // Assuming Logo component is here
import { menu } from './Sidebar/menu-data'
import SidebarItem from './Sidebar/SidebarItem'
import SidebarFooter from './Sidebar/SidebarFooter'


// --- Animation Variants for Staggered Menu Items (Keep defined locally or in menu-data.ts) ---
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

  // --- Utility Functions ---
  const handleLogout = () => logout();

  const toggle = (name: string) =>
    setExpanded((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))

  const isParentActive = (item: typeof menu[number]) => {
    if (forceActive) return item.name === forceActive
    if (item.path && pathname.startsWith(item.path)) return true
    if (item.children) return item.children.some((c) => pathname.startsWith(c.path))
    return false
  }

  const isChildActive = (path: string) => pathname.startsWith(path)

  // --- Effects ---
  // Control body overflow on sidebar open/close
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto'; // Cleanup
    };
  }, [isOpen]);

  // Expand parent menu items if a child is active
  useEffect(() => {
    const expandedParents = menu
      .filter(
        (item) =>
          item.children && item.children.some((child) => pathname.startsWith(child.path))
      )
      .map((item) => item.name)
    setExpanded(expandedParents)
  }, [pathname])

  // Placeholder for redirect logic (assuming a loading state component handles this)
  useEffect(() => {
    if (redirectUrl) {
      router.push(redirectUrl);
      setRedirectUrl(null);
    }
  }, [redirectUrl, router]);


  // --- Render Function ---
  const renderSidebarContent = (isMobile: boolean, isDesktopHovered = false) => (
    <aside
      className={`h-screen bg-[#111214] text-white flex flex-col font-nunito border-r-2 border-white/5 shadow-xl transition-all duration-300 ease-in-out relative
        ${isMobile ? 'w-[85%] max-w-sm' : isDesktopHovered ? 'w-64' : 'w-20'}
      `}
    >
      {/* Header/Logo Section */}
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
      
      {/* Menu Navigation */}
      <motion.nav
        className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar"
        variants={menuContainerVariants}
        initial="hidden"
        animate="show"
      >
        {menu.map((item) => {
          if (item.mobileOnly && !isMobile) return null;

          return (
            <SidebarItem
              key={item.name}
              item={item}
              isDesktopHovered={isDesktopHovered}
              isOpen={isOpen}
              isParentActive={isParentActive}
              isChildActive={isChildActive}
              expanded={expanded}
              toggle={toggle}
              toggleSidebar={toggleSidebar}
              setRedirectUrl={setRedirectUrl}
              handleLogout={handleLogout}
            />
          );
        })}
      </motion.nav>

      {/* Footer Section (Desktop Only) */}
      <SidebarFooter
        isDesktopHovered={isDesktopHovered}
        handleLogout={handleLogout}
        variants={menuItemVariants}
      />
    </aside>
  )

  return (
    <>
      {/* Font imports and styles */}
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