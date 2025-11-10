// src/components/Sidebar/SidebarItem.tsx
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MenuItem, NO_LOADING_ANIMATION_PATHS } from './menu-data';

// Variants for the staggered animation
const menuItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

type SidebarItemProps = {
  item: MenuItem;
  isDesktopHovered: boolean;
  isOpen: boolean;
  isParentActive: (item: MenuItem) => boolean;
  isChildActive: (path: string) => boolean;
  expanded: string[];
  toggle: (name: string) => void;
  toggleSidebar: () => void;
  setRedirectUrl: (url: string | null) => void;
  handleLogout: () => void;
};

export default function SidebarItem({
  item,
  isDesktopHovered,
  isOpen,
  isParentActive,
  isChildActive,
  expanded,
  toggle,
  toggleSidebar,
  setRedirectUrl,
  handleLogout,
}: SidebarItemProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Access check logic
  const hasAccess = !item.requiredAccess || (user?.access?.[item.requiredAccess] ?? false);
  const isRestricted = !hasAccess;

  const Icon = item.icon;
  const isOpenMenuItem = expanded.includes(item.name);
  const active = isParentActive(item);

  // Unify the button styling
  const buttonClass = `
    text-white hover:text-white transition-all duration-200
    ${isRestricted ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
    ${active && !isRestricted ? 'font-bold bg-white/10' : 'font-normal hover:bg-white/5'}
    ${item.name === 'Logout' ? 'text-red-500 hover:bg-red-500/10 hover:text-red-400' : ''}
  `;
  
  const isMobile = isOpen; // Use isOpen as proxy for mobile view when rendering the content

  const handleItemClick = (path?: string) => {
    if (isRestricted) return; 

    if (item.name === 'Logout') {
      handleLogout();
      return;
    }
    if (item.children) {
      toggle(item.name);
    } else if (path && path !== pathname) {
      if (NO_LOADING_ANIMATION_PATHS.has(path)) {
        router.push(path);
      } else {
        setRedirectUrl(path);
      }
      if (isOpen) toggleSidebar();
    }
  };

  return (
    <motion.div key={item.name} className="mb-1.5" variants={menuItemVariants}>
      <button
        onClick={() => handleItemClick(item.path)}
        className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 relative ${buttonClass}`}
        type="button"
        data-tooltip-id={`tooltip-${item.name.replace(/\s/g, '-')}`}
        data-tooltip-content={isRestricted ? "Access Restricted: Take permission from admin" : undefined}
        disabled={isRestricted}
      >
        <div className="relative flex items-center gap-3 overflow-hidden">
          <Icon
            size={18}
            className={`transition-colors flex-shrink-0 text-white ${isRestricted ? 'opacity-40' : 'opacity-100'}`}
          />
          <span
            className={`text-sm whitespace-nowrap transition-opacity duration-200 ${
              isMobile || isDesktopHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {item.name}
          </span>
        </div>
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full transition-opacity duration-300 ${
            active && !isRestricted ? 'opacity-100 bg-white shadow-glow' : 'opacity-0'
          }`}
        />
        {item.children &&
          (isMobile || isDesktopHovered ? (
            isOpenMenuItem ? (
              <ChevronDown
                size={16}
                className={`text-gray-500 group-hover:text-gray-300 transition-transform duration-200 flex-shrink-0 rotate-180 ${isRestricted ? 'opacity-0' : 'opacity-100'}`}
              />
            ) : (
              <ChevronRight
                size={16}
                className={`text-gray-500 group-hover:text-gray-300 transition-transform duration-200 flex-shrink-0 ${isRestricted ? 'opacity-0' : 'opacity-100'}`}
              />
            )
          ) : null)}
      </button>
      
      {isRestricted && (
        <Tooltip id={`tooltip-${item.name.replace(/\s/g, '-')}`} className="z-50" />
      )}
      
      {/* Children Dropdown */}
      {item.children && (
        <motion.div
          initial={false}
          animate={{ height: isOpenMenuItem ? 'auto' : 0, opacity: isOpenMenuItem ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
          className="ml-5 border-l border-gray-700 pl-4 overflow-hidden mt-2"
        >
          {item.children.map((child) => {
            const childIsActive = isChildActive(child.path);
            const childButtonClass = `
              text-white transition-all duration-200
              ${isRestricted ? 'opacity-40 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
              ${childIsActive && !isRestricted ? 'font-bold text-white/90' : 'font-normal hover:bg-white/5 text-white/70'}
            `;
            return (
              <button
                key={child.path}
                onClick={() => handleItemClick(child.path)}
                className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 mb-1 ${childButtonClass}`}
                type="button"
                disabled={isRestricted}
              >
                {child.name}
              </button>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}