"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext"; 
import { UsageProvider } from "@/contexts/UsageContext"; 
import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";

// --- Animated Hamburger Icon ---
type MotionLineProps = React.ComponentPropsWithoutRef<"line"> & { variants?: any; [key: string]: any };
const MotionLine = motion.line as React.FC<MotionLineProps>;

const AnimatedHamburgerIcon = ({
  isOpen,
  size = 20,
  strokeWidth = 2,
  className = "",
}: {
  isOpen: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) => {
  const commonLineAttributes = {
    vectorEffect: "non-scaling-stroke" as const,
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      animate={isOpen ? "open" : "closed"}
      initial={false}
      variants={{ open: {}, closed: {} }}
    >
      <MotionLine x1="4" y1="6" x2="20" y2="6" variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: 45, y: 6 } }} {...commonLineAttributes} />
      <MotionLine x1="4" y1="12" x2="20" y2="12" variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }} {...commonLineAttributes} />
      <MotionLine x1="4" y1="18" x2="20" y2="18" variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: -45, y: -6 } }} {...commonLineAttributes} />
    </motion.svg>
  );
};

// --- CHAOS STYLES (The Glitch Effect) ---
const GlobalChaosStyles = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <style jsx global>{`
      body {
        overflow-x: hidden;
        animation: shake-hard 0.2s infinite;
        background-color: #000 !important;
      }
      /* Disable interactions */
      body * {
        user-select: none !important;
        pointer-events: none !important;
      }
      /* Glitch everything */
      img, svg, div, p, h1, h2, span, button {
        filter: invert(1) hue-rotate(180deg) blur(0.5px);
        animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
      }
      /* Text scatter */
      h1, h2, h3, p, span, a {
        text-shadow: 2px 0 red, -2px 0 blue;
        animation: glitch-text 0.1s infinite;
        font-family: 'Courier New', Courier, monospace !important; 
      }
      @keyframes shake-hard {
        0% { transform: translate(1px, 1px) rotate(0deg); }
        10% { transform: translate(-3px, -2px) rotate(-1deg); }
        20% { transform: translate(-3px, 0px) rotate(1deg); }
        30% { transform: translate(3px, 2px) rotate(0deg); }
        40% { transform: translate(1px, -1px) rotate(1deg); }
        50% { transform: translate(-1px, 2px) rotate(-1deg); }
        60% { transform: translate(-3px, 1px) rotate(0deg); }
        70% { transform: translate(3px, 1px) rotate(-1deg); }
        80% { transform: translate(-1px, -1px) rotate(1deg); }
        90% { transform: translate(1px, 2px) rotate(0deg); }
        100% { transform: translate(1px, -2px) rotate(-1deg); }
      }
      @keyframes glitch-skew {
        0% { transform: skew(0deg); }
        20% { transform: skew(-10deg); }
        40% { transform: skew(10deg); }
        60% { transform: skew(-5deg); }
        80% { transform: skew(5deg); }
        100% { transform: skew(0deg); }
      }
      @keyframes glitch-text {
        0% { opacity: 1; transform: translateX(0); }
        50% { opacity: 0.8; transform: translateX(2px); }
        51% { opacity: 1; transform: translateX(-2px); }
        100% { opacity: 1; transform: translateX(0); }
      }
    `}</style>
  );
};

function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  // --- REAL TIME POLLING LOGIC ---
  const [isCrashed, setIsCrashed] = useState(false);

  useEffect(() => {
    // Poll the DB status every 3 seconds
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/system-status');
        if (res.ok) {
           const data = await res.json();
           setIsCrashed(data.crashed);
        }
      } catch (err) {
        console.error("Status check failed", err);
      }
    };

    // Initial check
    checkStatus();

    // Check every 3s
    const interval = setInterval(checkStatus, 3000); 

    return () => clearInterval(interval);
  }, []);
  // -------------------------------

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const forceActive = pathname === "/selector" ? "Dashboard" : undefined;
  const isEditorPage = pathname.startsWith("/editor");
  const isLoginPage = pathname === "/login";

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen || isCrashed ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen, isCrashed]);

  const themeBg = pathname === "/bgremover" ? "bg-white text-gray-900" 
    : pathname === "/poster" ? "bg-slate-100 text-slate-900"
    : pathname === "/idcard" ? "bg-slate-100 text-slate-900"
    : pathname === "/userprofile" ? "bg-[#F3F4F6] text-gray-900"
    : "bg-white text-gray-900"; 

  if (isEditorPage) return <>{children}</>;
  if (!isAuthenticated && !isLoginPage) return null;

  return (
    <>
      {/* Inject Global Glitch CSS if crashed */}
      <GlobalChaosStyles active={isCrashed} />

      {!isLoginPage ? (
        <div className={`flex relative z-10 min-h-screen ${themeBg}`}>
          <Sidebar forceActive={forceActive} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto transition-all duration-300 p-4 lg:p-8 relative">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                {pathname === "/dashboard" ? "" : "SSI Studios"}
              </h1>
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              >
                <AnimatedHamburgerIcon isOpen={isSidebarOpen} size={28} />
              </button>
            </div>
            {children}
          </main>
        </div>
      ) : (
        <main className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4 bg-white">{children}</main>
      )}
    </>
  );
}

export default function ClientRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <UsageProvider>
          <AppLayout>{children}</AppLayout>
        </UsageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}