
import React from 'react'
import { Resource } from '../types'
import { X, StickyNote } from 'lucide-react'

interface NoteViewerProps {
    isOpen: boolean
    note: Resource | null
    onClose: () => void
}

export const NoteViewer: React.FC<NoteViewerProps> = ({ isOpen, note, onClose }) => {
    if (!isOpen || !note) return null

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-yellow-500/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                    <div className="flex items-center gap-3">
                        <StickyNote className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest font-[Orbitron]">
                            {note.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Description */}
                    {note.description && (
                        <div className="mb-4 pb-4 border-b border-slate-800">
                            <p className="text-slate-400 text-sm italic">
                                {note.description}
                            </p>
                        </div>
                    )}

                    {/* Note Content */}
                    <div className="prose prose-invert max-w-none">
                        <pre className="bg-slate-800 border border-slate-700 p-4 text-slate-300 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                            {note.content}
                        </pre>
                    </div>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <div className="flex flex-wrap gap-2">
                                {note.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400 uppercase tracking-wider"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer - Date */}
                    <div className="mt-6 pt-4 border-t border-slate-800">
                        <span className="text-xs font-mono text-slate-600">
                            Created: {new Date(note.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
