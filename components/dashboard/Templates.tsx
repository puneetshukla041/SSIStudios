"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation'; 
import { ArrowUpRight, Sparkles, Frown } from "lucide-react";

interface TemplateCard {
  id: string;
  title: string;
  category: string;
  imageSrc: string;
  imageAlt: string;
  path: string;
  bgColorClass: string;
}

// ... (Keep the templateCards array exactly the same) ...
const templateCards: TemplateCard[] = [
  {
    id: "Poster1",
    title: "Event Poster",
    category: "Marketing",
    imageSrc: "/posters/images/coverimage.png",
    imageAlt: "Presentation template",
    path: "/poster/editor",
    bgColorClass: "bg-orange-50",
  },
  {
    id: "ID Card",
    title: "Corporate Identity",
    category: "Identity",
    imageSrc: "/idcard/images/coverimage.png",
    imageAlt: "ID Card template",
    path: "/idcard/images/coverimage.png",
    bgColorClass: "bg-purple-50",
  },
  {
    id: "visitingcards",
    title: "Modern Dark Card",
    category: "Business",
    imageSrc: "/visitingcard/images/coverimagedark.jpg",
    imageAlt: "Resume template",
    path: "/visitingcards/dark",
    bgColorClass: "bg-pink-50",
  },
  {
    id: "email",
    title: "Minimal Light Card",
    category: "Business",
    imageSrc: "/visitingcard/images/coverimagelight.jpg",
    imageAlt: "Email template",
    path: "/visitingcards/light",
    bgColorClass: "bg-blue-50",
  },
  {
    id: "certificate1",
    title: "Proctoring Cert",
    category: "Education",
    imageSrc: "/certificates/images/coverimageproctoriong.jpg",
    imageAlt: "certificate1",
    path: "/editor/instagram-post",
    bgColorClass: "bg-rose-50",
  },
  {
    id: "certificate2",
    title: "Training Completion",
    category: "Education",
    imageSrc: "/certificates/images/coverimagetraining.jpg",
    imageAlt: "certificate2",
    path: "/editor/video",
    bgColorClass: "bg-violet-50",
  },
];

export default function Templates({ searchQuery = "" }: { searchQuery?: string }) {
  const router = useRouter(); 

  const navigateTo = (path: string) => {
    router.push(path); 
  };

  const filteredTemplates = templateCards.filter(card => {
    const query = searchQuery.toLowerCase();
    return (
      card.title.toLowerCase().includes(query) ||
      card.category.toLowerCase().includes(query)
    );
  });

  return (
    <section className="w-full">
      <motion.div 
        layout
        // RESPONSIVE GRID: 1 col mobile, 2 cols tablet, 3 cols laptop, 4 cols desktop
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        <AnimatePresence>
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8 }} 
                className="group relative flex flex-col gap-3 cursor-pointer"
                onClick={() => navigateTo(card.path)}
              >
                {/* Image Container */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm transition-all duration-500 group-hover:shadow-lg group-hover:border-indigo-500/30">
                  <div className={`absolute inset-0 z-0 ${card.bgColorClass}`} />
                  <div
                    className="absolute inset-0 z-10 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url(${card.imageSrc})` }}
                  />
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  {/* Category Badge - Smaller text on mobile */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30">
                    <div className="backdrop-blur-md bg-white/70 border border-white/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {card.category}
                      </span>
                    </div>
                  </div>

                  {/* Hover Action (Hidden on touch devices usually, but logic remains) */}

<div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-90 cursor-pointer">
  <button
    className="hidden sm:flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-xl backdrop-blur-xl hover:bg-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
  >
    <Sparkles size={16} className="text-indigo-600" />
    Use this
  </button>
</div>

                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between px-1">
                  <div>
                     <h3 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {card.title}
                     </h3>
                  </div>
                  <div className="relative h-6 w-6 overflow-hidden hidden sm:block">
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full group-hover:translate-x-full">
                      <ArrowUpRight size={16} className="text-slate-300" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center -translate-x-full translate-y-full transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0">
                      <ArrowUpRight size={16} className="text-indigo-600" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Frown size={32} />
              </div>
              <p className="text-lg font-medium">No templates found for "{searchQuery}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}