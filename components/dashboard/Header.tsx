'use client'

import { Bell, Home, User } from 'lucide-react'
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

const THOUGHTS = [
  "Turning caffeine into code & dreams into reality.",
  "Simplicity is the soul of efficiency.",
  "Design is intelligence made visible.",
  "Limitless creation, one pixel at a time."
];

export default function DashboardHeader() {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [thoughtIndex, setThoughtIndex] = useState(0)
  const headerRef = useRef<HTMLElement>(null)

  // Manage expand/collapse state
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

  // Cycle thoughts every 1 second while expanded
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isExpanded) {
        intervalId = setInterval(() => {
            setThoughtIndex((prev) => (prev + 1) % THOUGHTS.length);
        }, 1000); // Changed to 1000ms (1 second) to match animation duration
    }

    return () => clearInterval(intervalId);
  }, [isExpanded]);

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
          width: isExpanded ? 'clamp(320px, 45vw, 600px)' : 120, 
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
          {/* Dynamic Thought Section */}
          <div className="flex-grow pl-6 pr-4 overflow-hidden mask-fade">
             {/* Key={thoughtIndex} forces the animation to restart on change */}
            <p 
                key={thoughtIndex} 
                className={clsx(
                    "text-white/95 text-sm font-medium whitespace-nowrap italic tracking-wide",
                    "animate-text-reveal" 
                )}
            >
              {THOUGHTS[thoughtIndex]}
            </p>
          </div>

          {/* Icons Section */}
          <div className="flex items-center gap-1 pr-2 shrink-0">
            <IconWrapper label="Notifications">
              <Bell size={20} />
            </IconWrapper>

            <Link href="/dashboard" className="relative">
              <IconWrapper label="Home">
                <Home size={20} />
              </IconWrapper>
            </Link>

            <div className="w-px h-6 bg-white/20 mx-1" />

            <Link href="/userprofile" className="relative">
              <IconWrapper label="User Account">
                <User size={20} />
              </IconWrapper>
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
          <Bell size={20} /> 
          <Link href="/dashboard">
            <Home size={20} className="cursor-pointer" />
          </Link>
          <User size={20} />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-green-500 border border-white rounded-full animate-ping-slow" />
        </div>

      </header>

      {/* Styles */}
      <style>{`
        /* Background Gradient Flow */
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

        /* Dot Pulse */
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.6; }
          100% { transform: scale(0.8); opacity: 1; }
        }
        .animate-ping-slow {
          animation: ping-slow 1.5s infinite ease-in-out;
        }

        /* UPDATED: Smoother, 1-second Text Reveal Animation */
        @keyframes text-reveal {
          /* Start slightly lower, blurred, transparent */
          0% { opacity: 0; transform: translateY(8px); filter: blur(3px); }
          /* Quickly arrive at center, focus in */
          30% { opacity: 1; transform: translateY(0); filter: blur(0px); }
          /* Stay still briefly */
          70% { opacity: 1; transform: translateY(0); filter: blur(0px); }
          /* Exit upwards, blurring out */
          100% { opacity: 0; transform: translateY(-8px); filter: blur(3px); }
        }
        .animate-text-reveal {
          /* Changed duration to 1s */
          animation: text-reveal 1s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
        
        .mask-fade {
             mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
             -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </>
  )
}