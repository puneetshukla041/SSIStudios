import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface SuccessAnimationProps {
    isVisible: boolean;
    message?: string;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ isVisible, message = "Success!" }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/10 backdrop-blur-sm"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: -20 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 20 
                        }}
                        className="relative bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[200px]"
                    >
                        {/* Animated Circle Background */}
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                                >
                                    <Check className="w-8 h-8 text-white stroke-[3]" />
                                </motion.div>
                            </motion.div>
                            
                            {/* Particles */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                                    animate={{ 
                                        opacity: 0, 
                                        scale: 1, 
                                        x: Math.cos(i * 60 * (Math.PI / 180)) * 60,
                                        y: Math.sin(i * 60 * (Math.PI / 180)) * 60
                                    }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full"
                                    style={{ marginLeft: -4, marginTop: -4 }}
                                />
                            ))}
                        </div>

                        <motion.h3 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl font-bold text-slate-800 tracking-tight"
                        >
                            {message}
                        </motion.h3>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SuccessAnimation;