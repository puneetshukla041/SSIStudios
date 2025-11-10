import { motion, AnimatePresence } from "framer-motion";

interface AnimatedModalsProps {
    isLoading: boolean;
    showTick: boolean;
    showWelcome: boolean;
    username: string;
}

/**
 * Renders the full-screen animated modals for login status (Loading, Success, Welcome).
 */
export default function AnimatedModals({ isLoading, showTick, showWelcome, username }: AnimatedModalsProps) {
    return (
        <AnimatePresence>
            {/* Loading Modal */}
            {isLoading && (
                <motion.div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="text-center text-white"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        <motion.div
                            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-white text-lg tracking-wide font-semibold">
                            Verifying credentials...
                        </p>
                    </motion.div>
                </motion.div>
            )}

            {/* Success Tick Modal */}
            {showTick && (
                <motion.div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative flex flex-col items-center justify-center rounded-3xl bg-white shadow-2xl p-10 w-[200px] h-[200px]"
                        initial={{ scale: 0, rotate: 20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <AnimatePresence>
                            {[...Array(14)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full bg-green-400"
                                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                    animate={{
                                        opacity: 0,
                                        x: Math.cos((i / 14) * 2 * Math.PI) * 100,
                                        y: Math.sin((i / 14) * 2 * Math.PI) * 100,
                                        scale: 0.5,
                                    }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            ))}
                        </AnimatePresence>
                        <motion.svg
                            className="w-20 h-20 text-green-500 relative z-10"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <motion.path
                                d="M5 13l4 4L19 7"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                        </motion.svg>
                        <motion.p
                            className="text-green-600 font-extrabold mt-3 text-2xl tracking-wide relative z-10"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            Success!
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}

            {/* Welcome Modal */}
            {showWelcome && (
                <motion.div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="absolute w-full h-full"
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-green-400/40 via-blue-400/30 to-purple-400/40 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </motion.div>
                    <AnimatePresence>
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400"
                                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                animate={{
                                    opacity: 0,
                                    x: Math.cos((i / 20) * 2 * Math.PI) * 400,
                                    y: Math.sin((i / 20) * 2 * Math.PI) * 400,
                                    scale: 0.5,
                                }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        ))}
                    </AnimatePresence>
                    <motion.div
                        className="relative bg-black/40 rounded-3xl p-12 text-center shadow-2xl border border-gray-700/60 backdrop-blur-3xl overflow-hidden"
                        initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
                        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                        <motion.h2
                            className="text-4xl font-extrabold mb-3 text-white relative inline-block"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            Welcome, <span className="text-pink-400">{username}!</span>
                        </motion.h2>
                        <motion.p
                            className="text-gray-300 text-xl font-light mt-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            Glad to see you back.
                        </motion.p>
                        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1), transparent 70%)' }} />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}