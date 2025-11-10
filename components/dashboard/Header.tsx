'use client'

import { Bell, Home, User, Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import Link from 'next/link'

// A reusable component for icon buttons
const IconWrapper = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <button
    type="button"
    aria-label={label}
    className="relative p-2 text-white/80 transition-all duration-200 rounded-full cursor-pointer hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95"
  >
    {children}
  </button>
)

export default function DashboardHeader() {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  // Manage expand/collapse state with delay
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    if (isHovered) {
      setIsExpanded(true)
    } else {
      timeoutId = setTimeout(() => {
        if (headerRef.current && !headerRef.current.matches(':hover')) {
          setIsExpanded(false)
        }
      }, 300)
    }
    return () => clearTimeout(timeoutId)
  }, [isHovered])

  return (
    <>
      <header
        ref={headerRef}
        aria-label="Dashboard header"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
          'relative mx-auto mt-6 flex items-center justify-center rounded-full backdrop-blur-xl overflow-hidden',
          'animate-gemini-flow',
          'border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.1)]',
          'transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isHovered && 'shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
        )}
        style={{
          width: isExpanded ? 'clamp(250px, 40vw, 500px)' : 120,
          padding: '4px',
        }}
      >
        {/* Expanded View */}
        <div
          className={clsx(
            'flex items-center justify-between w-full transition-opacity duration-300',
            isExpanded ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Search Section */}
          <div className="flex items-center flex-grow pl-2">
            <IconWrapper label="Search">
              <Search size={20} />
            </IconWrapper>
            <div
              className={clsx(
                'transition-all duration-300 ease-in-out',
                isExpanded ? 'w-full ml-2' : 'w-0 ml-0'
              )}
            >
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-transparent text-white placeholder:text-white/60 text-sm pl-2 pr-4 py-2 outline-none border-none"
              />
            </div>
          </div>

{/* Icons Section */}
<div className="flex items-center gap-1 pr-2">
  <IconWrapper label="Notifications">
    <Bell size={20} />
  </IconWrapper>

  {/* ✅ Home Icon now redirects */}
  <Link href="/dashboard" className="relative">
    <IconWrapper label="Home">
      <Home size={20} />
    </IconWrapper>
  </Link>

  <div className="w-px h-6 bg-white/20 mx-1" />

  {/* User Account Icon - Always show green dot */}
  <Link href="/userprofile" className="relative">
    {isExpanded ? (
      <IconWrapper label="User Account">
        <User size={20} />
      </IconWrapper>
    ) : (
      <User size={20} className="text-white/80" />
    )}

    {/* Small green dot with pulse */}
    <span className="absolute top-0 right-0 block w-2 h-2 bg-green-500 border border-white rounded-full animate-ping-slow" />
  </Link>
</div>

        </div>

{/* Collapsed State View */}
<div
  className={clsx(
    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-5 text-white/80 transition-opacity duration-300',
    isExpanded ? 'opacity-0' : 'opacity-100',
    'pointer-events-none'
  )}
>
  <Search size={20} />
  
  {/* ✅ Home with link */}
  <Link href="/dashboard">
    <Home size={20} className="cursor-pointer" />
  </Link>

  <User size={20} />
  <span className="absolute top-0 right-0 block w-2 h-2 bg-green-500 border border-white rounded-full animate-ping-slow" />
</div>

      </header>

      {/* Animated Gradient Background and pulse animation */}
      <style>{`
        @keyframes gemini-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gemini-flow {
          background-image: linear-gradient(
            -45deg,
            rgba(79, 61, 244, 0.8),
            rgba(122, 60, 241, 0.8),
            rgba(249, 53, 182, 0.7),
            rgba(0, 197, 197, 0.8),
            rgba(79, 61, 244, 0.8)
          );
          background-size: 400% 400%;
          animation: gemini-flow 15s ease infinite;
        }

        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.6; }
          100% { transform: scale(0.8); opacity: 1; }
        }
        .animate-ping-slow {
          animation: ping-slow 1.5s infinite ease-in-out;
        }
      `}</style>
    </>
  )
}
