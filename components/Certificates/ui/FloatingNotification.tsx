import React from 'react';
import { BadgeCheck, Info, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

interface FloatingNotificationProps {
    message: string;
    type: 'success' | 'info' | 'error' | 'selection';
    isVisible: boolean;
    onClose?: () => void;
}

const FloatingNotification: React.FC<FloatingNotificationProps> = ({ message, type, isVisible, onClose }) => {
    
    // Configuration for different notification types
    const config = {
        success: {
            icon: BadgeCheck,
            style: "border-emerald-500/30 text-emerald-400",
            glow: "bg-emerald-500/20",
            bgIcon: "bg-emerald-500/10"
        },
        error: {
            icon: XCircle,
            style: "border-rose-500/30 text-rose-400",
            glow: "bg-rose-500/20",
            bgIcon: "bg-rose-500/10"
        },
        info: {
            icon: Info,
            style: "border-sky-500/30 text-sky-400",
            glow: "bg-sky-500/20",
            bgIcon: "bg-sky-500/10"
        },
        selection: {
            icon: BadgeCheck,
            style: "border-indigo-500/30 text-indigo-400",
            glow: "bg-indigo-500/20",
            bgIcon: "bg-indigo-500/10"
        }
    };

    const currentConfig = config[type] || config.info;
    const Icon = currentConfig.icon;

    return (
        <div 
            className={clsx(
                "fixed top-24 left-1/2 transform -translate-x-1/2 z-[100]",
                "flex items-center gap-3 pr-2 pl-3 py-2",
                "bg-slate-900/95 backdrop-blur-md",
                "border shadow-2xl shadow-black/20",
                "rounded-full",
                "transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)", // Spring-like animation
                currentConfig.style,
                isVisible 
                    ? "translate-y-0 opacity-100 scale-100" 
                    : "-translate-y-8 opacity-0 scale-95 pointer-events-none"
            )}
        >
            {/* Icon Wrapper with Glow */}
            <div className={clsx(
                "relative flex items-center justify-center w-8 h-8 rounded-full",
                currentConfig.bgIcon
            )}>
                <Icon className="w-5 h-5 relative z-10" />
                {/* Ambient Glow behind icon */}
                <div className={clsx("absolute inset-0 rounded-full blur-md opacity-50", currentConfig.glow)} />
            </div>

            {/* Message */}
            <span className="text-sm font-medium text-slate-100 whitespace-nowrap pr-2">
                {message}
            </span>

            {/* Divider */}
            {onClose && (
                <div className="w-px h-4 bg-slate-700 mx-1" />
            )}

            {/* Close Button */}
            {onClose && (
                <button 
                    onClick={onClose}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default FloatingNotification;