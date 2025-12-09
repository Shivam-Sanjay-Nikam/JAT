
import React, { useState } from 'react'
import { useTodos } from '../hooks/useTodos'
import { TodoItem } from './TodoItem'
import { Plus, ListTodo } from 'lucide-react'

export const TodoList: React.FC = () => {
    const { todos, loading, addTodo, toggleTodo, deleteTodo, completionPercentage, completedCount, totalCount } = useTodos()
    const [newTodoTitle, setNewTodoTitle] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTodoTitle.trim()) return

        setIsAdding(true)
        await addTodo(newTodoTitle.trim())
        setNewTodoTitle('')
        setIsAdding(false)
    }

    return (
        <div className="space-y-4">
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
            <form onSubmit={handleAddTodo} className="flex gap-2">
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
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
