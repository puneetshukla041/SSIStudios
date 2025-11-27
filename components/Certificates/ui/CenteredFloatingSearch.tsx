'use client'

import { Bell, Home, User, Search, X, Command } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import clsx from 'clsx'

// --- Utility Components ---

/**
 * A highly polished icon button with a subtle "spotlight" hover effect.
 */
const IconWrapper = ({ 
  children, 
  label, 
  onClick,
  active = false,
  badge = false
}: { 
  children: React.ReactNode; 
  label: string;
  onClick?: () => void;
  active?: boolean;
  badge?: boolean;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={clsx(
      "group relative flex items-center justify-center p-2.5 rounded-full transition-all duration-300",
      "hover:bg-white/10 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-white/30",
      active ? "text-white bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]" : "text-white/70 hover:text-white"
    )}
  >
    {children}
    {/* Subtle glow on hover */}
    <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-white/5 to-transparent blur-sm" />
    
    {/* Notification Badge */}
    {badge && (
      <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 border-2 border-transparent rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
    )}
  </button>
)

export default function DashboardHeader() {
  // --- State ---
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)

  // --- Refs ---
  const headerRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // --- Handlers ---
  const handleClear = useCallback(() => {
    setSearchQuery('')
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Searching for:', searchQuery)
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      handleClear()
      inputRef.current?.blur()
    }
  }

  // --- Expansion Logic ---
  // Uses a debounce timer to prevent the menu from snapping shut instantly when the mouse slips off
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    
    // If the user focuses the input, force keep expanded
    if (isInputFocused) {
      setIsExpanded(true)
      return
    }

    if (isHovered) {
      setIsExpanded(true)
    } else {
      timeoutId = setTimeout(() => {
        // Double check hover state before closing
        if (headerRef.current && !headerRef.current.matches(':hover') && document.activeElement !== inputRef.current) {
          setIsExpanded(false)
        }
      }, 400) // Increased delay for smoother UX
    }
    return () => clearTimeout(timeoutId)
  }, [isHovered, isInputFocused])

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        {/* Main Container 
          pointer-events-auto is required because the parent is pointer-events-none 
          to allow clicking through to the page content on the sides 
        */}
        <header
          ref={headerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={clsx(
            "pointer-events-auto relative flex items-center overflow-hidden",
            "backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]", // Premium spring-like easing
            "border border-white/10",
            isExpanded ? "rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]" : "rounded-full shadow-[0_8px_20px_-5px_rgba(0,0,0,0.3)]",
            // The animated background container
            "bg-slate-900/80" 
          )}
          style={{
            // Fluid width transition
            width: isExpanded ? '600px' : '140px',
            height: '64px',
          }}
        >
          {/* Animated Background Gradient layer
            We separate this to avoid layout thrashing on the main element 
          */}
          <div className="absolute inset-0 z-0 opacity-20 animate-aurora pointer-events-none mix-blend-screen" />
          
          {/* Inner Content Wrapper */}
          <div className="relative z-10 flex items-center justify-between w-full px-2 h-full">
            
            {/* --- LEFT: Search Section --- */}
            <div className={clsx(
              "flex items-center transition-all duration-500 ease-out",
              isExpanded ? "flex-grow pl-2 opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-4 pointer-events-none"
            )}>
              <div className={clsx(
                "relative flex items-center w-full group transition-all duration-300 rounded-xl overflow-hidden",
                isInputFocused ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5 hover:bg-white/10"
              )}>
                <Search size={18} className={clsx("ml-3 transition-colors", isInputFocused ? "text-sky-400" : "text-white/40")} />
                
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none text-white text-sm px-3 py-2.5 placeholder:text-white/30"
                />
                
                {/* Right side of input: Clear button or shortcut hint */}
                <div className="pr-2 flex items-center">
                  {searchQuery ? (
                    <button 
                      onClick={handleClear}
                      className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/20 transition-all"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-white/30">
                      <Command size={10} />
                      <span>K</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- RIGHT: Navigation Icons --- */}
            <div className={clsx(
              "flex items-center gap-1 transition-all duration-500",
              // When collapsed, center the icons. When expanded, push them to the right.
              isExpanded ? "pr-2 pl-4 border-l border-white/10 ml-4" : "w-full justify-between px-1"
            )}>
              
              {/* Search Trigger (Visible only when collapsed) */}
              <div className={clsx("transition-all duration-300 absolute left-4", isExpanded ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100")}>
                <IconWrapper label="Open Search">
                   <Search size={20} />
                </IconWrapper>
              </div>

              {/* Navigation Group */}
              <div className={clsx(
                "flex items-center gap-1 transition-transform duration-500",
                !isExpanded && "translate-x-[44px]" // Shift icons to center when collapsed
              )}>
                <a href="/dashboard">
                   <IconWrapper label="Home" active={!isExpanded}>
                     <Home size={20} />
                   </IconWrapper>
                </a>
                
                <IconWrapper label="Notifications" badge={true}>
                   <Bell size={20} />
                </IconWrapper>
                
                <a href="/userprofile" className="relative">
                  <div className="p-1 rounded-full border border-white/10 hover:border-white/30 transition-colors ml-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      JD
                    </div>
                    {/* Status Dot */}
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  </div>
                </a>
              </div>
            </div>

          </div>
        </header>
      </div>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes aurora {
          0% { background-position: 50% 50%, 50% 50%; }
          50% { background-position: 100% 0%, 0% 100%; }
          100% { background-position: 50% 50%, 50% 50%; }
        }
        .animate-aurora {
          background-image: 
            radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.5) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.5) 0px, transparent 50%);
          background-size: 150% 150%;
          animation: aurora 15s ease infinite alternate;
        }
      `}</style>
    </>
  )
}