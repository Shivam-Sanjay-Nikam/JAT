
import React from 'react'
import { Navbar } from '../components/Navbar'
import { TodoList } from '../components/TodoList'
import { StreakCalendar } from '../components/StreakCalendar'
import { useTodos } from '../hooks/useTodos'
import { useStreak } from '../hooks/useStreak'
import { useGamification } from '../context/GamificationContext'
import { LevelProgressBar } from '../components/LevelProgressBar'
import { Calendar, CheckSquare } from 'lucide-react'

export const Todo: React.FC = () => {
    const [selectedDate, setSelectedDate] = React.useState(new Date())
    const { completionPercentage, completedCount, totalCount, allTimeStats } = useTodos(selectedDate, setSelectedDate)
    const { currentStreak } = useStreak()
    const { level, currentExp, nextLevelExp } = useGamification()

    // Get today's date formatted
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="border-b border-slate-800 pb-6 mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckSquare className="w-6 h-6 text-primary-500" />
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-[Orbitron] uppercase tracking-[0.2em]">
                            Task_Protocol
                        </h1>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-primary-400 font-mono text-xs tracking-wider">
                            &gt; {today.toUpperCase()}
                        </p>
                        <div className="flex items-center gap-4 text-xs font-mono">
                            <span className="text-slate-500">
                                PROGRESS: <span className="text-primary-400">{completionPercentage}%</span>
                            </span>
                            <span className="text-slate-500">
                                STREAK: <span className="text-primary-400">{currentStreak} 🔥</span>
                            </span>
                        </div>
                    </div>
                </div>

                <LevelProgressBar
                    level={level}
                    currentExp={currentExp}
                    nextLevelExp={nextLevelExp}
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Todo List (2/3 width on large screens) */}
                    <div className="lg:col-span-2">
                        <TodoList
                            date={selectedDate}
                            onDateChange={setSelectedDate}
                        />
                    </div>

                    {/* Right: Streak Calendar (1/3 width on large screens) */}
                    <div className="lg:col-span-1">
                        <StreakCalendar
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            allTimeStats={allTimeStats}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
