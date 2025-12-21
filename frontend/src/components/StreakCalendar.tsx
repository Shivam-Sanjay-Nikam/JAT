
import React, { useState } from 'react'
import { useStreak } from '../hooks/useStreak'
import { Flame, Trophy, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'

interface StreakCalendarProps {
    selectedDate?: Date
    onDateSelect?: (date: Date) => void
    allTimeStats?: { total: number; completed: number }
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ selectedDate, onDateSelect, allTimeStats }) => {
    const { currentStreak, longestStreak, completionHistory, loading } = useStreak()
    const [hoveredDate, setHoveredDate] = useState<string | null>(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())


    // Generate calendar days for the selected month
    const generateCalendarDays = () => {
        const days = []
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        // Get first and last day of selected month
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        // Get day of week for first day (0 = Sunday, 6 = Saturday)
        const firstDayOfWeek = firstDay.getDay()

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push({
                date: '',
                completion: null,
                isToday: false,
                isEmpty: true
            })
        }

        // Add all days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day)
            const dateYear = date.getFullYear()
            const dateMonth = String(date.getMonth() + 1).padStart(2, '0')
            const dateDay = String(date.getDate()).padStart(2, '0')
            const dateStr = `${dateYear}-${dateMonth}-${dateDay}`
            const completion = completionHistory.find(c => c.date === dateStr)

            const today = new Date()
            const todayYear = today.getFullYear()
            const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
            const todayDay = String(today.getDate()).padStart(2, '0')
            const todayStr = `${todayYear}-${todayMonth}-${todayDay}`
            const isToday = dateStr === todayStr

            days.push({
                date: dateStr,
                completion: completion || null,
                isToday,
                isEmpty: false
            })
        }

        return days
    }

    const calendarDays = generateCalendarDays()

    // Group days by week for grid layout (7 days per week)
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

                {/* All Time Stats */}
                <div className="bg-slate-900/50 border border-slate-700 p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckSquare className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">All Time Tasks</span>
                        </div>
                        <div className="text-3xl font-bold text-white font-[Orbitron]">
                            {allTimeStats?.completed || 0}
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-1">
                            out of {allTimeStats?.total || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Header */}
            <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary-500" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-[Orbitron]">
                            Activity_Calendar
                        </h3>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            className="p-1 text-slate-500 hover:text-primary-400 transition-colors"
                            title="Previous month"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono text-slate-400 min-w-[100px] text-center">
                            {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                        </span>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            className="p-1 text-slate-500 hover:text-primary-400 transition-colors"
                            title="Next month"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                    🔥 = 100% COMPLETION
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
                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="w-10 h-6 flex items-center justify-center">
                                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                                            {day}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, idx) => (
                                    day.isEmpty ? (
                                        <div key={`empty-${idx}`} className="w-10 h-10" />
                                    ) : (
                                        <div
                                            key={day.date}
                                            className={`w-12 h-12 border transition-all cursor-pointer hover:scale-105 relative flex flex-col items-center justify-center gap-0.5 ${selectedDate && day.date === selectedDate.toISOString().split('T')[0] ? 'bg-primary-500/20 border-primary-500 shadow-[0_0_15px_rgba(var(--primary-500),0.3)]' : getCellColor(day.completion)
                                                } ${day.isToday ? 'ring-1 ring-primary-400 ring-offset-1 ring-offset-slate-950' : ''}`}
                                            onClick={() => onDateSelect?.(new Date(day.date))}
                                            onMouseEnter={() => setHoveredDate(day.date)}
                                            onMouseLeave={() => setHoveredDate(null)}
                                            title={day.date}
                                        >
                                            <span className="text-[10px] font-bold text-slate-200 z-10 leading-none">
                                                {new Date(day.date).getDate()}
                                            </span>
                                            {day.completion && day.completion.total_tasks > 0 && (
                                                <div className="flex items-center gap-[1px] text-[7px] font-mono z-10 leading-none bg-slate-950/40 px-1.5 py-px rounded-full backdrop-blur-[1px]">
                                                    <span className="text-primary-400 font-bold">{day.completion.completed_tasks}</span>
                                                    <span className="text-slate-500">/</span>
                                                    <span className="text-slate-400">{day.completion.total_tasks}</span>
                                                </div>
                                            )}
                                            {day.completion?.completion_percentage === 100 && (
                                                <div className="absolute -top-1 -right-1 z-20 pointer-events-none filter drop-shadow-md">
                                                    <span className="text-[10px]">🔥</span>
                                                </div>
                                            )}
                                        </div>
                                    )
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
