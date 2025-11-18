// components/dashboard/Templates.tsx
"use client";
import { motion } from "framer-motion";
// 👈 IMPORT: Import useRouter for Next.js navigation
import { useRouter } from 'next/navigation'; 

interface TemplateCard {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  path: string;
  bgColorClass: string;
  textColorClass: string;
}

const templateCards: TemplateCard[] = [
  // ... (Your templateCards array remains the same)
  {
    id: "Poster1",
    title: "Poster",
    imageSrc: "/posters/images/coverimage.png",
    imageAlt: "Presentation template",
    path: "/poster/editor",
    bgColorClass: "bg-gradient-to-br from-orange-200 to-orange-100",
    textColorClass: "text-gray-900",
  },
  {
    id: "ID Card",
    title: "ID Card",
    imageSrc: "/idcard/images/coverimage.png",
    imageAlt: "ID Card template",
    path: "/idcard/images/coverimage.png",
    bgColorClass: "bg-gradient-to-br from-purple-200 to-purple-100",
    textColorClass: "text-gray-900",
  },
  {
    id: "visitingcards",
    title: "VisitingCards(Dark)",
    imageSrc: "/visitingcard/images/coverimagedark.jpg",
    imageAlt: "Resume template",
    path: "/visitingcards/dark",
    bgColorClass: "bg-gradient-to-br from-pink-200 to-pink-100",
    textColorClass: "text-gray-900",
  },
  {
    id: "email",
    title: "Email",
    imageSrc: "/visitingcard/images/coverimagelight.jpg",
    imageAlt: "Email template",
    path: "/visitingcards/light",
    bgColorClass: "bg-gradient-to-br from-blue-200 to-blue-100",
    textColorClass: "text-gray-900",
  },
  {
    id: "certificate1",
    title: "certificate1",
    imageSrc: "/certificates/images/coverimageproctoriong.jpg",
    imageAlt: "certificate1",
    path: "/editor/instagram-post",
    bgColorClass: "bg-gradient-to-br from-rose-200 to-rose-100",
    textColorClass: "text-gray-900",
  },
  {
    id: "certificate2",
    title: "certificate2",
    imageSrc: "/certificates/images/coverimagetraining.jpg",
    imageAlt: "certificate2",
    path: "/editor/video",
    bgColorClass: "bg-gradient-to-br from-violet-200 to-violet-100",
    textColorClass: "text-gray-900",
  },
];

export default function Templates() {
  // 👈 HOOK: Initialize the router
  const router = useRouter(); 

  const navigateTo = (path: string) => {

    router.push(path); 
  };
  return (
    // ... (Rest of the component remains the same)
    <section className="mb-12 mt-12">
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-900">
        Explore templates
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {templateCards.map((card, index) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.4, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo(card.path)} // This line correctly triggers navigation
            className={`
              relative flex items-end justify-end p-4 rounded-xl shadow-lg
              transition-all duration-300 group cursor-pointer overflow-hidden
              ${card.bgColorClass}
              
              aspect-square sm:aspect-video
            `}
          >
            {/* Background image */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-right-bottom transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundImage: `url(${card.imageSrc})`,
                backgroundPosition: "center",
                backgroundSize: "cover", 
              }}
            />

            {/* Hover overlay: Provides contrast for white text on hover */}
            <div className="absolute inset-0 z-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            
          </motion.button>
        ))}
      </div>
    </section>
  );
}