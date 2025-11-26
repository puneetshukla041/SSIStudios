"use client";

import { useState } from "react"; // Import useState
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus, Eraser, Settings, Layers2Icon, LayoutGrid, Palette,
  Search, LayoutTemplate, Video, Megaphone, Briefcase,
  ArrowRight, Sparkles, X // Import X icon
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import Usernameheader from "@/components/dashboard/usernameheader";
import Templates from "@/components/dashboard/Templates";

// --- Types ---
interface QuickAction {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  gradient: string;
  path: string;
  keywords: string[]; // Added keywords for better search
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
  
  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState("");

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const quickActions: QuickAction[] = [
    {
      id: "create-poster",
      label: "Create Poster",
      subLabel: "Start from scratch",
      icon: <Plus size={24} className="text-white" />,
      gradient: "from-blue-500 to-indigo-600",
      path: "/poster/editor",
      keywords: ["marketing", "design", "canvas"],
    },
    {
      id: "manage-certs",
      label: "Certificates",
      subLabel: "Issue & Manage",
      icon: <Layers2Icon size={24} className="text-white" />,
      gradient: "from-orange-400 to-pink-500",
      path: "/selector/visitingcard",
      keywords: ["docs", "diploma", "award"],
    },
    {
      id: "bg-remover",
      label: "BG Remover",
      subLabel: "AI Powered tool",
      icon: <Eraser size={24} className="text-white" />,
      gradient: "from-emerald-400 to-teal-600",
      path: "/bgremover",
      keywords: ["image", "edit", "clean", "transparent"],
    },
    {
      id: "visiting-cards",
      label: "Visiting Cards",
      subLabel: "Digital Identity",
      icon: <LayoutGrid size={24} className="text-white" />,
      gradient: "from-violet-500 to-purple-600",
      path: "/selector/idcard",
      keywords: ["id", "contact", "business"],
    },
    {
      id: "design-tools",
      label: "Design Tools",
      subLabel: "Utilities kit",
      icon: <Palette size={24} className="text-white" />,
      gradient: "from-cyan-400 to-blue-500",
      path: "/design-tools",
      keywords: ["color", "draw", "kit"],
    },
    {
      id: "settings",
      label: "Themes",
      subLabel: "Customize look",
      icon: <Settings size={24} className="text-white" />,
      gradient: "from-slate-700 to-slate-900",
      path: "/theme",
      keywords: ["dark mode", "appearance", "config"],
    },
  ];

  const heroFilters = [
    { label: "Presentations", icon: <LayoutTemplate size={16} /> },
    { label: "Social Media", icon: <LayoutGrid size={16} /> },
    { label: "Videos", icon: <Video size={16} /> },
    { label: "Marketing", icon: <Megaphone size={16} /> },
    { label: "Office", icon: <Briefcase size={16} /> },
  ];

  // --- Filter Logic for Tools ---
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

      <div className="relative z-10 px-6 sm:px-8 lg:px-12 xl:px-20 pb-24 max-w-[1920px] mx-auto">
        
        {/* Header */}
        <div className="pt-6 mb-8 space-y-6">
          <div className="hidden lg:block"> <Header /> </div>
          <Usernameheader />
        </div>

        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full rounded-[2rem] overflow-hidden mb-16 shadow-2xl shadow-indigo-500/10 group"
        >
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#DB2777] opacity-95" />
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20 space-y-10">
            <div className="space-y-4 max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white/90 text-xs font-medium"
              >
                <Sparkles size={12} /> <span>New AI Features Available</span>
              </motion.div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-sm leading-[1.1]">
                What will you <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-pink-200">create</span> today?
              </h1>
            </div>
            
            {/* --- Working Search Bar --- */}
            <div className="w-full max-w-2xl relative group/search">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full transition-opacity opacity-0 group-hover/search:opacity-100" />
              <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-lg transition-all focus-within:bg-white/15 focus-within:border-white/40 focus-within:scale-[1.01]">
                <div className="pl-4 pr-3 text-white/60">
                  <Search size={22} />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search templates, projects, or tools..." 
                  className="flex-1 bg-transparent h-12 text-white placeholder:text-white/50 text-lg outline-none"
                />
                {/* Clear Button (Visible only when typing) */}
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="mr-2 p-2 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <button className="h-11 px-6 rounded-full bg-white text-indigo-600 font-semibold text-sm hover:bg-blue-50 transition-colors shadow-sm">
                  Search
                </button>
              </div>
            </div>

            {/* Filter Pills (Clicking sets search) */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
               {heroFilters.map((filter, idx) => (
                 <motion.button 
                   key={filter.label}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 + (idx * 0.05) }}
                   onClick={() => setSearchQuery(filter.label)} // Make filters working
                   className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/20 hover:bg-black/30 border border-white/10 text-white text-sm font-medium transition-all backdrop-blur-sm hover:scale-105 active:scale-95"
                 >
                   {filter.icon} {filter.label}
                 </motion.button>
               ))}
            </div>
          </div>
        </motion.section>

        {/* --- Tools Section (Filtered) --- */}
        {/* Only show section if items exist or if query is empty */}
        {(filteredActions.length > 0) && (
          <section className="mb-24">
            <div className="flex items-end justify-between mb-8 px-1">
              <div>
                  <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Your Tools</h2>
                  <p className="text-slate-500 mt-2 text-base">
                    {searchQuery ? `Search results for "${searchQuery}"` : "Quick access to your workspace utilities"}
                  </p>
              </div>
            </div>

            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filteredActions.map((action) => (
                  <motion.div
                    key={action.id}
                    layout // Helps smooth animation when filtering
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.96 }}
                    className="group relative h-48 cursor-pointer"
                    onClick={() => navigateTo(action.path)}
                  >
                    {/* ... (Card content remains exactly the same) ... */}
                    <div className="absolute inset-0 bg-white rounded-[1.5rem] shadow-sm border border-slate-200 transition-all duration-300 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] group-hover:border-indigo-100" />
                    <div className="relative h-full p-6 flex flex-col justify-between z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${action.gradient} transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
                          {action.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{action.label}</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1 group-hover:text-slate-500">{action.subLabel}</p>
                      </div>
                      <div className="absolute top-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-500" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        )}

        {/* --- Templates Section (Passes Search Query) --- */}
        <section className="w-full relative">
          <div className="flex items-center justify-between mb-8 px-1">
             <div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Templates</h2>
                <p className="text-slate-500 mt-2 text-base">Hand-picked recommendations</p>
             </div>
             <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all">
               Explore all <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
             </button>
          </div>
          
          <div className="w-full">
             {/* Pass the search query prop here */}
             <Templates searchQuery={searchQuery} />
          </div>
        </section>

      </div>
    </main>
  );
}