"use client";

import { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus, Eraser, Settings, Layers2Icon, LayoutGrid, Palette,
  Search, LayoutTemplate, Video, Megaphone, Briefcase, CreditCard, Image, StarIcon, BugIcon, PercentSquareIcon,
  ArrowRight, Sparkles, X
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import Usernameheader from "@/components/dashboard/usernameheader";


// --- Types ---
interface QuickAction {
  id: string;
  label: string;
  subLabel: string;
  icon: any;
  gradient: string;
  path: string;
  keywords: string[];
}

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const quickActions: QuickAction[] = [
    {
      id: "create-poster",
      label: "Create Poster",
      subLabel: "Start scratch",
      icon: Plus,
      gradient: "from-blue-500 to-indigo-600",
      path: "/poster",
      keywords: ["marketing", "design", "canvas"],
    },
    {
      id: "manage-certs",
      label: "Certificates",
      subLabel: "Issue Docs",
      icon: Layers2Icon,
      gradient: "from-orange-400 to-pink-500",
      path: "/certificates/database",
      keywords: ["docs", "diploma", "award"],
    },
    {
      id: "bg-remover",
      label: "BG Remover",
      subLabel: "AI Tool",
      icon: Eraser,
      gradient: "from-emerald-400 to-teal-600",
      path: "/bgremover",
      keywords: ["image", "edit", "clean", "transparent"],
    },
    {
      id: "visiting-cards",
      label: "Visiting Cards",
      subLabel: "Identity",
      icon: LayoutGrid,
      gradient: "from-violet-500 to-purple-600",
      path: "/visitingcards",
      keywords: ["id", "contact", "business"],
    },
    {
      id: "id-card",
      label: "ID Card",
      subLabel: "Utilities",
      icon: CreditCard,
      gradient: "from-cyan-400 to-blue-500",
      path: "/idcard",
      keywords: ["color", "draw", "kit"],
    },
    {
      id: "settings",
      label: "Themes",
      subLabel: "Customize",
      icon: Settings,
      gradient: "from-slate-700 to-slate-900",
      path: "/theme",
      keywords: ["dark mode", "appearance", "config"],
    },
  ];

  const heroFilters = [
    { label: "Assets", icon: <LayoutTemplate size={16} />, path: "/assets" },
    { label: "Themes", icon: <Image size={16} />, path: "/themes" },
    { label: "Rate Us", icon: <StarIcon size={16} />, path: "/reportbug" },
    { label: "Report a Bug", icon: <BugIcon size={16} />, path: "/reportbug" },
  ];

  const filteredActions = quickActions.filter((action) => {
    const query = searchQuery.toLowerCase();
    return (
      action.label.toLowerCase().includes(query) ||
      action.subLabel.toLowerCase().includes(query) ||
      action.keywords.some(k => k.includes(query))
    );
  });

  return (
    <main className="relative flex-1 min-h-screen bg-slate-50/50 text-slate-900 overflow-x-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[120px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-8 lg:px-12 xl:px-20 pb-12 sm:pb-24 max-w-[1920px] mx-auto">

        {/* Header */}
        <div className="pt-4 sm:pt-6 mb-6 sm:mb-8 space-y-4 sm:space-y-6">
          <div className="hidden lg:block"> <Header /> </div>
          <Usernameheader />
        </div>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full rounded-3xl sm:rounded-[2rem] overflow-hidden mb-10 sm:mb-16 shadow-2xl shadow-indigo-500/10 group"
        >
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#DB2777] opacity-95" />
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-12 sm:px-6 sm:py-20 space-y-8 sm:space-y-10">
            <div className="space-y-4 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white/90 text-xs font-medium"
              >
                <span>A SSI APPLICATION</span>
              </motion.div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-sm leading-[1.1]">
                What will you <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-pink-200">create</span>?
              </h1>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-2xl relative group/search">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full transition-opacity opacity-0 group-hover/search:opacity-100" />
              <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-lg transition-all focus-within:bg-white/15 focus-within:border-white/40 focus-within:scale-[1.01]">
                <div className="pl-3 sm:pl-4 pr-2 text-white/60">
                  <Search size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 bg-transparent h-10 sm:h-12 text-white placeholder:text-white/50 text-base sm:text-lg outline-none min-w-0"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="p-2 text-white/70 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
                <button className="h-9 sm:h-11 px-4 sm:px-6 rounded-full bg-white text-indigo-600 font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-sm cursor-pointer">
                  Search
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
              {heroFilters.map((filter, idx) => (
                <motion.button
                  key={filter.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.05) }}
                  onClick={() => navigateTo(filter.path)}
                  // ✅ Added cursor-pointer here
                  className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black/20 hover:bg-black/30 border border-white/10 text-white text-xs sm:text-sm font-medium transition-all backdrop-blur-sm cursor-pointer"
                >
                  {filter.icon} {filter.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* --- Tools Section --- */}
        {(filteredActions.length > 0) && (
          <section className="mb-16 sm:mb-24">
            <div className="flex items-end justify-between mb-6 sm:mb-8 px-1">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Your Tools</h2>
                <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base truncate max-w-[300px] sm:max-w-none">
                  {searchQuery ? `Results for "${searchQuery}"` : "Quick access to your workspace"}
                </p>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filteredActions.map((action) => (
                  <motion.div
                    key={action.id}
                    layout
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.96 }}
                    // ✅ cursor-pointer is already present here
                    className="group relative h-40 sm:h-48 cursor-pointer"
                    onClick={() => navigateTo(action.path)}
                  >
                    <div className="absolute inset-0 bg-white rounded-2xl sm:rounded-[1.5rem] shadow-sm border border-slate-200 transition-all duration-300 group-hover:shadow-lg group-hover:border-indigo-100" />

                    <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between z-10">
                      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${action.gradient} transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
                        <action.icon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {action.label}
                        </h3>
                        <p className="text-slate-400 text-[10px] sm:text-xs font-medium mt-0.5 sm:mt-1 group-hover:text-slate-500 line-clamp-1">
                          {action.subLabel}
                        </p>
                      </div>

                      <div className="hidden sm:block absolute top-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-500" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        )}

    
      </div>
    </main>
  );
}