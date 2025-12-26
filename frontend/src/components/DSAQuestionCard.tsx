import React, { useState } from 'react'
import { Resource } from '../types'
import { CheckCircle2, Circle, RotateCcw, Pencil, Trash2, Eye } from 'lucide-react'
import { NoteViewer } from './NoteViewer'

interface DSAQuestionCardProps {
    question: Resource
    onEdit: (question: Resource) => void
    onDelete: (id: string) => void
    onToggleComplete: (question: Resource) => void
    onToggleRevise: (question: Resource) => void
}

export const DSAQuestionCard: React.FC<DSAQuestionCardProps> = ({
    question,
    onEdit,
    onDelete,
    onToggleComplete,
    onToggleRevise
}) => {
    const [viewingNote, setViewingNote] = useState(false)
    const isCompleted = question.tags?.includes('Completed') || false
    const needsRevise = question.tags?.includes('Revise') || false
    const otherTags = question.tags?.filter(tag => tag !== 'DSA' && tag !== 'Completed' && tag !== 'Revise') || []

    // Special styling for questions that need revision
    const getCardStyle = () => {
        if (needsRevise) {
            return 'border-orange-500/50 bg-orange-500/10 hover:border-orange-500/70'
        }
        if (isCompleted) {
            return 'border-green-500/30 bg-green-500/5 hover:border-green-500/50'
        }
        return 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
    }

    return (
        <div
            className={`border ${getCardStyle()} p-4 transition-all group relative overflow-hidden rounded`}
        >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Revise Badge */}
            {needsRevise && (
                <div className="absolute top-2 right-2 bg-orange-500/20 border border-orange-500/50 px-2 py-1 rounded">
                    <div className="flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-orange-400" />
                        <span className="text-[9px] font-mono text-orange-400 uppercase tracking-wider">Revise</span>
                    </div>
                </div>
            )}

            <div className="relative z-10 space-y-3">
                {/* Header with completion checkbox */}
                <div className="flex items-start gap-3">
                    <button
                        onClick={() => onToggleComplete(question)}
                        className="mt-1 flex-shrink-0"
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                        {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                            <Circle className="w-5 h-5 text-slate-500 hover:text-slate-400" />
                        )}
                    </button>
                    <div className="flex-1 min-w-0">
                        <h3 className={`text-white font-semibold ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                            {question.title}
                        </h3>
                        {question.description && (
                            <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                                {question.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Tags (excluding DSA, Completed, Revise) */}
                {otherTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {otherTags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 uppercase tracking-wider"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                        onClick={() => setViewingNote(true)}
                        className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-wider"
                        title="View notes"
                    >
                        <Eye className="w-3 h-3" />
                        Notes
                    </button>
                    <button
                        onClick={() => onToggleRevise(question)}
                        className={`px-3 py-1.5 border transition-colors flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-wider ${
                            needsRevise
                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 hover:bg-orange-500/30'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-orange-400 hover:border-orange-500/50'
                        }`}
                        title={needsRevise ? 'Remove revise tag' : 'Mark for revision'}
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onEdit(question)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-primary-400 transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onDelete(question.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Note Viewer Modal */}
            <NoteViewer
                isOpen={viewingNote}
                note={question}
                onClose={() => setViewingNote(false)}
            />
        </div>
    )
}

