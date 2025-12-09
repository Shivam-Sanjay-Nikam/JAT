
import React from 'react'
import { Check, X } from 'lucide-react'
import { Todo } from '../types'

interface TodoItemProps {
    todo: Todo
    onToggle: (id: string) => void
    onDelete: (id: string) => void
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
    return (
        <div className={`group flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 hover:border-primary-500/30 transition-all ${todo.is_completed ? 'opacity-60' : ''}`}>
            {/* Checkbox */}
            <button
                onClick={() => onToggle(todo.id)}
                className={`flex-shrink-0 w-5 h-5 border-2 flex items-center justify-center transition-all ${todo.is_completed
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-600 hover:border-primary-500'
                    }`}
            >
                {todo.is_completed && <Check className="w-3 h-3 text-slate-900" strokeWidth={3} />}
            </button>

            {/* Title */}
            <span className={`flex-1 text-sm font-mono ${todo.is_completed
                    ? 'line-through text-slate-500'
                    : 'text-slate-200'
                }`}>
                {todo.title}
            </span>

            {/* Delete Button */}
            <button
                onClick={() => onDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
                title="Delete task"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
