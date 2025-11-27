"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme, CherryBlossomBackground } from "@/contexts/ThemeContext";
import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UsageProvider } from "@/contexts/UsageContext"; 

// --- App Layout ---
function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const forceActive = pathname === "/selector" ? "Dashboard" : undefined;

  const isEditorPage = pathname.startsWith("/editor");
  const isLoginPage = pathname === "/login";

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // ✅ Theme Background Logic
  const themeBg =
    pathname === "/dashboard"
      ? "bg-gray-50 text-gray-900"
      : pathname === "/bgremover"
      ? "bg-white text-gray-900"
      : pathname === "/idcard"
      ? "bg-slate-100 text-slate-900"
      : pathname === "/certificates/database"
      ? "bg-[#F8FAFC] text-gray-900"
      : theme === "light"
      ? "bg-white text-gray-900"
      : "relative overflow-hidden text-gray-900"; // Blossom

  if (isEditorPage) return <>{children}</>;

  if (!isAuthenticated && !isLoginPage) return null;

  return (
    <>
      <CherryBlossomBackground />
      {!isLoginPage ? (
        <div className={`flex relative z-10 min-h-screen ${themeBg}`}>
          <Sidebar forceActive={forceActive} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          
          {/* ✅ Added ml-4 here for the left margin */}
          <main className="flex-1 overflow-y-auto transition-all duration-300 p-4 lg:p-8 ml-16 relative">
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