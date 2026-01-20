
import React, { useState, useEffect, useRef } from 'react'
import { useTodos } from '../hooks/useTodos'
import { TodoItem } from './TodoItem'
import { Plus, ListTodo, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useGamification } from '../context/GamificationContext'
import { TaskCompletionModal } from './TaskCompletionModal'
import { LevelUpModal } from './LevelUpModal'

interface TodoListProps {
    date?: Date
    onDateChange?: (date: Date) => void
}

export const TodoList: React.FC<TodoListProps> = ({ date, onDateChange }) => {
    const {
        todos,
        loading,
        addTodo,
        toggleTodo,
        deleteTodo,
        completionPercentage,
        completedCount,
        totalCount,
        selectedDate,
        isToday,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        refresh,
        checkDailyCompletion
    } = useTodos(date, onDateChange)

    const { completeTaskWithRating, level, loading: gamificationLoading } = useGamification()

    const [newTodoTitle, setNewTodoTitle] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    // Multi-day State
    const [isMultiDay, setIsMultiDay] = useState(false)
    const [dayCount, setDayCount] = useState(3) // Default 3 days

    // Gamification State
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [selectedTaskForRating, setSelectedTaskForRating] = useState<{ id: string, title: string, exp: number } | null>(null)
    const [showLevelUpModal, setShowLevelUpModal] = useState(false)
    const previousLevelRef = useRef<number | null>(null)

    // Check for level up
    useEffect(() => {
        // If loading, do nothing (wait for initial sync)
        if (gamificationLoading) return

        // If previousLevelRef is null (first load), just sync it
        if (previousLevelRef.current === null) {
            previousLevelRef.current = level
            return
        }

        // Real level up check
        if (previousLevelRef.current !== null && level > previousLevelRef.current) {
            setShowLevelUpModal(true)
        }
        previousLevelRef.current = level
    }, [level, gamificationLoading])

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTodoTitle.trim()) return

        setIsAdding(true)

        if (isMultiDay && dayCount > 1) {
            const startDate = new Date() // Start today as requested
            const endDate = new Date()
            endDate.setDate(startDate.getDate() + (dayCount - 1)) // If 3 days: Today + 2 more days

            await addTodo(newTodoTitle.trim(), startDate, endDate)
            setIsMultiDay(false) // Reset after add
        } else {
            await addTodo(newTodoTitle.trim())
        }

        setNewTodoTitle('')
        setIsAdding(false)
    }

    const handleToggleAttempt = async (id: string) => {
        const todo = todos.find(t => t.id === id)
        if (!todo) return

        if (todo.is_completed) {
            // If already completed, normal toggle (uncomplete)
            await toggleTodo(id)
        } else {
            // If not completed, open rating modal
            setSelectedTaskForRating({
                id: todo.id,
                title: todo.title,
                exp: todo.exp_value || 10
            })
            setShowRatingModal(true)
        }
    }

    const handleRatingSubmit = async (rating: number) => {
        if (!selectedTaskForRating) return

        try {
            await completeTaskWithRating(selectedTaskForRating.id, rating)
            const todoCallback = todos.find(t => t.id === selectedTaskForRating.id)
            if (todoCallback) {
                await checkDailyCompletion(todoCallback.date)
            }
            await refresh() // Refresh todos to show completed status
            setShowRatingModal(false)
            setSelectedTaskForRating(null)
        } catch (error) {
            console.error("Failed to complete task with rating", error)
        }
    }

    // Format the selected date
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="space-y-4">
            {/* Gamification Modals */}
            {selectedTaskForRating && (
                <TaskCompletionModal
                    isOpen={showRatingModal}
                    taskTitle={selectedTaskForRating.title}
                    baseExp={selectedTaskForRating.exp}
                    onClose={() => setShowRatingModal(false)}
                    onSubmit={handleRatingSubmit}
                />
            )}

            <LevelUpModal
                isOpen={showLevelUpModal}
                newLevel={level}
                onClose={() => setShowLevelUpModal(false)}
            />

            {/* Date Navigation Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPreviousDay}
                        className="p-1.5 text-slate-500 hover:text-primary-400 transition-colors border border-slate-800 hover:border-primary-500/30"
                        title="Previous day"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            <span className="text-sm font-mono text-slate-300">
                                {formattedDate}
                            </span>
                        </div>
                        {!isToday && (
                            <button
                                onClick={goToToday}
                                className="text-[10px] font-mono text-primary-400 hover:text-primary-300 transition-colors text-left"
                            >
                                ← Back to Today
                            </button>
                        )}
                    </div>
                    <button
                        onClick={goToNextDay}
                        className="p-1.5 text-slate-500 hover:text-primary-400 transition-colors border border-slate-800 hover:border-primary-500/30"
                        title="Next day"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Header with Progress */}
            <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest font-[Orbitron]">
                            Today's_Tasks
                        </h2>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                        {completedCount}/{totalCount} COMPLETE
                    </div>
                </div>

                {/* Progress Bar */}
                {totalCount > 0 && (
                    <div className="relative h-2 bg-slate-900 border border-slate-800 overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                        />
                        {completionPercentage === 100 && (
                            <div className="absolute inset-0 bg-primary-500/20 animate-pulse" />
                        )}
                    </div>
                )}

                {completionPercentage === 100 && totalCount > 0 && (
                    <p className="mt-2 text-xs font-mono text-primary-400 flex items-center gap-1">
                        <span className="text-base">🔥</span> STREAK_MAINTAINED
                    </p>
                )}
            </div>

            {/* Add Todo Form */}
            <form onSubmit={handleAddTodo} className="space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newTodoTitle}
                            onChange={(e) => setNewTodoTitle(e.target.value)}
                            placeholder="ADD_NEW_TASK..."
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm font-mono py-2.5 px-3 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 placeholder:text-slate-600"
                            disabled={isAdding}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding || !newTodoTitle.trim()}
                        className="btn-primary flex items-center gap-1.5 text-xs py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        <span>ADD</span>
                    </button>
                </div>

                {/* Multi-day Options */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsMultiDay(!isMultiDay)}
                        className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded border transition-colors ${isMultiDay
                            ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                    >
                        <Calendar className="w-3 h-3" />
                        <span>Repeat for Days</span>
                    </button>

                    {isMultiDay && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                            <input
                                type="number"
                                min="2"
                                max="365"
                                value={dayCount}
                                onChange={(e) => setDayCount(parseInt(e.target.value) || 2)}
                                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs py-1 px-2 rounded focus:border-primary-500 w-16"
                            />
                            <span className="text-slate-600 text-xs">days starting today</span>
                        </div>
                    )}
                </div>
            </form>

            {/* Todo List */}
            <div className="space-y-2">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 bg-slate-900/50 border border-slate-800 animate-pulse" />
                    ))
                ) : todos.length === 0 ? (
                    <div className="py-12 text-center border border-slate-800 border-dashed bg-slate-900/20">
                        <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-700">
                            <ListTodo className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="text-sm text-primary-400 font-[Orbitron] tracking-widest uppercase mb-1">
                            No_Tasks_Today
                        </p>
                        <p className="text-slate-600 font-mono text-xs">
                            ADD YOUR FIRST TASK TO START
                        </p>
                    </div>
                ) : (
                    todos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggleAttempt}
                            onDelete={deleteTodo}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
