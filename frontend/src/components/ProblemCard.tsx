import React from 'react'
import { Problem } from '../hooks/useProblems'
import { CheckCircle2, Circle, RotateCcw, Pencil, Trash2, Eye, AlertCircle } from 'lucide-react'

interface ProblemCardProps {
    problem: Problem
    onToggleComplete: (id: string) => void
    onToggleRevise: (id: string) => void
    onEdit: (problem: Problem) => void
    onDelete: (id: string) => void
    onView: (problem: Problem) => void
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
    problem,
    onToggleComplete,
    onToggleRevise,
    onEdit,
    onDelete,
    onView
}) => {
    const hasReviseTag = problem.needsRevision
    const isCompleted = problem.isCompleted

    // Special styling for problems that need revision
    const getCardStyles = () => {
        if (hasReviseTag && isCompleted) {
            return 'border-orange-500/50 bg-orange-500/10 hover:border-orange-500/70'
        } else if (hasReviseTag) {
            return 'border-yellow-500/50 bg-yellow-500/10 hover:border-yellow-500/70'
        } else if (isCompleted) {
            return 'border-green-500/30 bg-green-500/5 hover:border-green-500/50'
        }
        return 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
    }

    return (
        <div
            className={`border ${getCardStyles()} p-4 transition-all group relative overflow-hidden`}
        >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Revision indicator badge */}
            {hasReviseTag && (
                <div className="absolute top-2 right-2 z-20">
                    <div className="bg-yellow-500/20 border border-yellow-500/50 px-2 py-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-yellow-400" />
                        <span className="text-[9px] font-mono text-yellow-400 uppercase tracking-wider">
                            Revise
                        </span>
                    </div>
                </div>
            )}

            <div className="relative z-10 flex items-start gap-4">
                {/* Completion checkbox */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleComplete(problem.id)
                    }}
                    className="mt-1 flex-shrink-0"
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                >
                    {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-primary-400 transition-colors" />
                    )}
                </button>

                {/* Problem content */}
                <div className="flex-1 min-w-0">
                    <h3 className={`text-white font-semibold mb-1 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                        {problem.title}
                    </h3>
                    {problem.description && (
                        <p className="text-slate-500 text-xs mb-2 line-clamp-2">
                            {problem.description}
                        </p>
                    )}

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {problem.tags
                                .filter(tag => tag.toLowerCase() !== 'dsa' && tag.toLowerCase() !== 'completed')
                                .map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className={`px-2 py-0.5 border text-[10px] font-mono uppercase tracking-wider ${
                                            tag.toLowerCase() === 'revise'
                                                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                                                : 'bg-slate-800 border-slate-700 text-slate-400'
                                        }`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onView(problem)
                        }}
                        className="p-2 text-slate-500 hover:text-primary-400 transition-colors"
                        title="View notes"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleRevise(problem.id)
                        }}
                        className={`p-2 transition-colors ${
                            hasReviseTag
                                ? 'text-yellow-400 hover:text-yellow-300'
                                : 'text-slate-500 hover:text-yellow-400'
                        }`}
                        title={hasReviseTag ? 'Remove revise tag' : 'Mark for revision'}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(problem)
                        }}
                        className="p-2 text-slate-500 hover:text-primary-400 transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(problem.id)
                        }}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

