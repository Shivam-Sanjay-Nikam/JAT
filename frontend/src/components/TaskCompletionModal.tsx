
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'

interface TaskCompletionModalProps {
    isOpen: boolean
    taskTitle: string
    baseExp: number
    onClose: () => void
    onSubmit: (rating: number) => void
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
    isOpen,
    taskTitle,
    baseExp,
    onClose,
    onSubmit
}) => {
    const [rating, setRating] = useState<number>(0)
    const [hoverRating, setHoverRating] = useState<number>(0)

    const multipliers = [0.4, 0.6, 0.8, 1.0, 1.2]
    const currentMultiplier = rating > 0 ? multipliers[rating - 1] : 1.0
    const earnedExp = Math.floor(baseExp * currentMultiplier)

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/10 blur-3xl rounded-full pointer-events-none" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-white mb-1">Task Complete!</h2>
                        <p className="text-slate-400 text-sm truncate px-4">{taskTitle}</p>
                    </div>

                    <div className="flex flex-col items-center gap-6 mb-8">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-mono">Rate Performance</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="relative group transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            size={32}
                                            className={`transition-colors duration-200 ${(hoverRating || rating) >= star
                                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                                    : 'text-slate-700'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-950/50 rounded-lg p-4 w-full border border-slate-800/50">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-slate-400">Base EXP</span>
                                <span className="text-sm font-mono text-slate-300">{baseExp}</span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-slate-400">Multiplier</span>
                                <span className={`text-sm font-mono ${rating > 0 ? 'text-primary-400' : 'text-slate-600'}`}>
                                    x{currentMultiplier.toFixed(1)}
                                </span>
                            </div>
                            <div className="h-px bg-slate-800 my-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-white">Total Earned</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-primary-400 font-[Orbitron]">{earnedExp}</span>
                                    <span className="text-xs text-slate-500 font-mono">EXP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onSubmit(rating || 5)} // Default 5 if skipped? Or force? Let's default 5 for ux speed
                        className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-lg shadow-lg shadow-primary-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Collect Rewards</span>
                    </button>

                    {rating === 0 && (
                        <p className="text-center text-[10px] text-slate-600 mt-3">
                            Select a rating to calculate final EXP
                        </p>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
