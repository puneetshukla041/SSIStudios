// D:\ssistudios\ssistudios\components\Certificates\ui\FloatingNotification.tsx

import React from 'react';
import { BadgeCheck, Loader2, X } from 'lucide-react';

interface FloatingNotificationProps {
    message: string;
    type: 'success' | 'info' | 'error' | 'selection';
    isVisible: boolean;
    onClose?: () => void;
}

const getStyles = (type: string) => {
    switch (type) {
        case 'success':
            return {
                icon: <BadgeCheck className="w-5 h-5 text-green-500" />,
                bg: 'bg-black/90',
                text: 'text-white',
                border: 'border-green-600',
            };
        case 'error':
            return {
                icon: <X className="w-5 h-5 text-red-500" />,
                bg: 'bg-black/90',
                text: 'text-white',
                border: 'border-red-600',
            };
        case 'selection':
        case 'info':
        default:
            return {
                icon: <BadgeCheck className="w-5 h-5 text-sky-500" />,
                bg: 'bg-black/90',
                text: 'text-white',
                border: 'border-sky-600',
            };
    }
};

const FloatingNotification: React.FC<FloatingNotificationProps> = ({ message, type, isVisible, onClose }) => {
    const { icon, bg, text, border } = getStyles(type);

    return (
        <div 
            className={`
                fixed top-4 left-1/2 transform -translate-x-1/2 
                max-w-xs w-full z-[1000] 
                transition-all duration-500 ease-out 
                p-3 rounded-full shadow-2xl backdrop-blur-sm
                ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}
                ${bg} ${text} ${border} border
                pointer-events-auto
            `}
        >
            <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-full ${border} bg-gray-900/50`}>
                    {icon}
                </div>
                <span className="text-sm font-medium flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {message}
                </span>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full transition">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FloatingNotification;