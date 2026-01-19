
import React from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

interface LevelProgressBarProps {
    level: number
    currentExp: number
    nextLevelExp: number
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ level, currentExp, nextLevelExp }) => {
    const progress = Math.min((currentExp / nextLevelExp) * 100, 100)

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />

            <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-primary-500/20">
                        {level}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Current Level</span>
                        <span className="text-sm font-bold text-white font-[Orbitron]">LEVEL {level}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">
                        <span className="text-primary-400 font-bold">{currentExp}</span> / {nextLevelExp} EXP
                    </span>
                </div>
            </div>

            {/* Progress Bar Container */}
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/50">
                {/* Progress Bar Fill */}
                <motion.div
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* Shimmer Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />
                </motion.div>
            </div>

            <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>BEGINNER</span>
                <span>MASTER</span>
            </div>
        </div>
    )
}
