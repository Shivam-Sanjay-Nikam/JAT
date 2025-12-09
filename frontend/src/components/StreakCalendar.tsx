
import React, { useState } from 'react'
import { useStreak } from '../hooks/useStreak'
import { Flame, Trophy, Calendar as CalendarIcon } from 'lucide-react'

export const StreakCalendar: React.FC = () => {
    const { currentStreak, longestStreak, completionHistory, loading } = useStreak()
    const [hoveredDate, setHoveredDate] = useState<string | null>(null)

    // Generate last 365 days
    const generateCalendarDays = () => {
        const days = []
        const today = new Date()

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            const completion = completionHistory.find(c => c.date === dateStr)

            days.push({
                date: dateStr,
                completion: completion || null,
                isToday: dateStr === today.toISOString().split('T')[0]
            })
        }

        return days
    }

    const calendarDays = generateCalendarDays()

    // Group days by week for grid layout
    const weeks: typeof calendarDays[] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7))
    }

    const getCellColor = (completion: any) => {
        if (!completion || completion.total_tasks === 0) {
            return 'bg-slate-900 border-slate-800'
        }

        if (completion.completion_percentage === 100) {
            return 'bg-primary-500/30 border-primary-500/50'
        } else if (completion.completion_percentage >= 50) {
            return 'bg-primary-500/10 border-primary-500/20'
        } else {
            return 'bg-slate-800 border-slate-700'
        }
    }

    const hoveredCompletion = hoveredDate
        ? completionHistory.find(c => c.date === hoveredDate)
        : null

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                {/* Current Streak */}
                <div className="bg-slate-900/50 border border-primary-500/30 p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-primary-500" />
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Current Streak</span>
                        </div>
                        <div className="text-3xl font-bold text-white font-[Orbitron]">
                            {loading ? '...' : currentStreak}
                        </div>
                        <div className="text-xs font-mono text-primary-400 mt-1">
                            {currentStreak === 1 ? 'DAY' : 'DAYS'}
                        </div>
                    </div>
                </div>

                {/* Longest Streak */}
                <div className="bg-slate-900/50 border border-slate-700 p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Best Streak</span>
                        </div>
                        <div className="text-3xl font-bold text-white font-[Orbitron]">
                            {loading ? '...' : longestStreak}
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-1">
                            {longestStreak === 1 ? 'DAY' : 'DAYS'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Header */}
            <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest font-[Orbitron]">
                        Activity_Calendar
                    </h3>
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                    LAST 365 DAYS // 🔥 = 100% COMPLETION
                </p>
            </div>

            {/* Calendar Grid */}
            <div className="relative">
                {loading ? (
                    <div className="h-48 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-2">
                        <div className="inline-block">
                            {/* Month Labels */}
                            <div className="flex gap-1 mb-2">
                                {weeks.map((week, weekIdx) => {
                                    // Get the first day of this week to determine the month
                                    const firstDay = week[0]
                                    const date = new Date(firstDay.date)
                                    const monthName = date.toLocaleDateString('en-US', { month: 'short' })

                                    // Only show month label if it's the first week of the month or first week overall
                                    const showLabel = weekIdx === 0 ||
                                        (weekIdx > 0 && new Date(weeks[weekIdx - 1][0].date).getMonth() !== date.getMonth())

                                    return (
                                        <div key={`month-${weekIdx}`} className="w-3 flex items-center justify-center">
                                            {showLabel && (
                                                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap -rotate-0">
                                                    {monthName}
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Calendar Grid */}
                            <div className="inline-flex gap-1">
                                {weeks.map((week, weekIdx) => (
                                    <div key={weekIdx} className="flex flex-col gap-1">
                                        {week.map((day) => (
                                            <div
                                                key={day.date}
                                                className={`w-3 h-3 border transition-all cursor-pointer hover:scale-125 relative ${getCellColor(day.completion)} ${day.isToday ? 'ring-1 ring-primary-400 ring-offset-1 ring-offset-slate-950' : ''
                                                    }`}
                                                onMouseEnter={() => setHoveredDate(day.date)}
                                                onMouseLeave={() => setHoveredDate(null)}
                                                title={day.date}
                                            >
                                                {day.completion?.completion_percentage === 100 && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-[6px]">
                                                        🔥
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tooltip */}
                {hoveredDate && (
                    <div className="mt-4 p-3 bg-slate-900 border border-primary-500/30 text-xs font-mono">
                        <div className="text-primary-400 mb-1">{new Date(hoveredDate).toLocaleDateString()}</div>
                        {hoveredCompletion ? (
                            <>
                                <div className="text-slate-300">
                                    {hoveredCompletion.completed_tasks}/{hoveredCompletion.total_tasks} tasks completed
                                </div>
                                <div className="text-slate-400">
                                    {hoveredCompletion.completion_percentage}% complete
                                </div>
                            </>
                        ) : (
                            <div className="text-slate-500">No tasks</div>
                        )}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                <span>LESS</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-900 border border-slate-800" />
                    <div className="w-3 h-3 bg-slate-800 border border-slate-700" />
                    <div className="w-3 h-3 bg-primary-500/10 border border-primary-500/20" />
                    <div className="w-3 h-3 bg-primary-500/30 border border-primary-500/50" />
                </div>
                <span>MORE</span>
            </div>
        </div>
    )
}
