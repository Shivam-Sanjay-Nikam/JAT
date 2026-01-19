
import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface LevelUpModalProps {
    isOpen: boolean
    newLevel: number
    onClose: () => void
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, newLevel, onClose }) => {

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#0ea5e9', '#6366f1', '#a855f7']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#0ea5e9', '#6366f1', '#a855f7']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(99,102,241,0.3)] relative overflow-visible text-center"
                >
                    {/* Glow Effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 relative inline-block"
                    >
                        <Trophy size={80} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] mx-auto" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-4 -right-4"
                        >
                            <Sparkles size={32} className="text-indigo-400" />
                        </motion.div>
                    </motion.div>

                    <h2 className="text-3xl font-black text-white italic mb-2 font-[Orbitron] uppercase tracking-wider relative z-10">
                        Level Up!
                    </h2>

                    <p className="text-slate-400 mb-8 max-w-[200px] mx-auto relative z-10">
                        Configuration upgraded. System efficiency increased.
                    </p>

                    <div className="bg-slate-950/50 rounded-xl p-6 border border-indigo-500/20 mb-8 relative z-10">
                        <span className="block text-xs text-indigo-400 uppercase tracking-widest mb-1">New Clearance</span>
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-[Orbitron]">
                            {newLevel}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors shadow-lg active:scale-95 relative z-10"
                    >
                        Continue
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
