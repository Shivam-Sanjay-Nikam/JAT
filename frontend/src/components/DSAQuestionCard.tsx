import React, { useState } from 'react'
import { Resource } from '../types'
import { CheckCircle2, Circle, RotateCcw, Pencil, Trash2, Eye, ExternalLink } from 'lucide-react'
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
            className={`border ${getCardStyle()} p-3 transition-all group relative overflow-hidden flex items-center gap-4`}
        >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex items-center gap-4 flex-1 min-w-0">
                {/* Completion checkbox */}
                <button
                    onClick={() => onToggleComplete(question)}
                    className="flex-shrink-0"
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                >
                    {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-slate-400" />
                    )}
                </button>

                {/* Title and Link */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={`text-white font-semibold truncate ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                            {question.title}
                        </h3>
                        {needsRevise && (
                            <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/50 px-2 py-0.5 rounded flex-shrink-0">
                                <RotateCcw className="w-3 h-3 text-orange-400" />
                                <span className="text-[9px] font-mono text-orange-400 uppercase tracking-wider">Revise</span>
                            </div>
                        )}
                    </div>
                    {question.description && (
                        <a
                            href={question.description}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-400 hover:text-blue-300 text-xs mt-0.5 truncate flex items-center gap-1 group/link"
                        >
                            <span className="truncate">{question.description}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                    )}
                </div>

                {/* Tags (excluding DSA, Completed, Revise) */}
                {otherTags.length > 0 && (
                    <div className="hidden md:flex flex-wrap gap-1.5 flex-shrink-0">
                        {otherTags.slice(0, 3).map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 uppercase tracking-wider"
                            >
                                {tag}
                            </span>
                        ))}
                        {otherTags.length > 3 && (
                            <span className="px-2 py-0.5 text-[10px] font-mono text-slate-500">
                                +{otherTags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => setViewingNote(true)}
                        className="p-2 text-slate-500 hover:text-white transition-colors"
                        title="View notes"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onToggleRevise(question)}
                        className={`p-2 transition-colors ${
                            needsRevise
                                ? 'text-orange-400 hover:text-orange-300'
                                : 'text-slate-500 hover:text-orange-400'
                        }`}
                        title={needsRevise ? 'Remove revise tag' : 'Mark for revision'}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(question)}
                        className="p-2 text-slate-500 hover:text-primary-400 transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(question.id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
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

