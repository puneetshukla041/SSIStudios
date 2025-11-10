// src/components/Sidebar/menu-data.ts

import {
  Home, FileText, Layers, Palette, Settings, BugIcon, FileImage,
  LayoutTemplate, LogOut, Layout, Star,
} from 'lucide-react';
import type { UserAccess } from '@/contexts/AuthContext';

// --- Types ---
export type MenuItem = {
  name: string;
  icon: React.ElementType;
  path?: string;
  children?: { name: string; path: string }[];
  onClick?: () => void;
  mobileOnly?: boolean;
  requiredAccess?: keyof UserAccess;
};

// --- Static Menu Data ---
export const menu: MenuItem[] = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  {
    name: 'Bg Remover',
    icon: FileImage,
    path: "/bgremover",
    requiredAccess: 'bgRemover',
  },
  {
    name: 'Image Enhancer',
    icon: Star,
    path: '/imageenhancer',
    requiredAccess: 'imageEnhancer',
  },
  {
    name: 'ID Card Maker',
    icon: LayoutTemplate,
    path: "/idcard",
    requiredAccess: 'idCard',
  },
  {
    name: 'Posters',
    icon: Layout,
    path: "/poster/editor",
    requiredAccess: 'posterEditor',
  },
  
  {
    name: 'Visiting Cards',
    icon: FileText,
    requiredAccess: 'visitingCard',
    children: [
      { name: 'Dark Theme', path: '/selector/visitingcard/dark' },
      { name: 'Light Theme', path: '/selector/visitingcard/light' },
    ],
  },
  {
    name: 'Certificates',
    icon: Layers,
    path: '/selector/certificate',
    requiredAccess: 'certificateEditor',
  },

  {
    name: 'Branding Assets',
    icon: Palette,
    requiredAccess: 'assets',
    children: [
      { name: 'Logo Library', path: '/logo' },
    ],
  },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'Theme', path: '/theme' },
      { name: 'Profile & Preferences', path: '/userprofile' },
    ],
  },
  {
    name: 'Report an Bug',
    icon: BugIcon,
    path: "/reportbug",
    requiredAccess: 'idCard',
  },
  { name: 'Logout', icon: LogOut, mobileOnly: true },
];

// Define the menu items that should NOT show the loading animation
export const NO_LOADING_ANIMATION_PATHS = new Set([
  '/dashboard',
  '/logo',
  '/theme',
  '/userprofile',
]);