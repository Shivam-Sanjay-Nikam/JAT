import React, { useState, useEffect } from 'react'
import { Problem } from '../hooks/useProblems'
import { X } from 'lucide-react'

interface ProblemFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (problemData: {
        title: string
        description?: string
        content: string
        tags?: string[]
    }) => Promise<void>
    editingProblem?: Problem | null
}

export const ProblemForm: React.FC<ProblemFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingProblem
}) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [content, setContent] = useState('')
    const [tags, setTags] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Update form values when editingProblem changes
    useEffect(() => {
        if (editingProblem) {
            setTitle(editingProblem.title)
            setDescription(editingProblem.description || '')
            setContent(editingProblem.content)
            // Filter out DSA and Completed tags from display (they're auto-managed)
            const displayTags = (editingProblem.tags || []).filter(
                tag => tag.toLowerCase() !== 'dsa' && tag.toLowerCase() !== 'completed'
            )
            setTags(displayTags.join(', '))
        } else {
            // Reset form when not editing
            setTitle('')
            setDescription('')
            setContent('')
            setTags('')
        }
    }, [editingProblem])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const tagArray = tags
                ? tags.split(',').map(t => t.trim()).filter(Boolean)
                : []

            await onSubmit({
                title,
                description: description || undefined,
                content,
                tags: tagArray
            })

            // Reset form
            setTitle('')
            setDescription('')
            setContent('')
            setTags('')
            onClose()
        } catch (error) {
            console.error('Error submitting problem:', error)
            alert('Failed to save problem')
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setContent('')
        setTags('')
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-primary-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest font-[Orbitron]">
                        {editingProblem ? 'Edit_Problem' : 'New_Problem'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                            Problem Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                            placeholder="e.g., Two Sum, Reverse Linked List..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                            Problem Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm resize-none"
                            placeholder="Brief description of the problem..."
                        />
                    </div>

                    {/* Notes/Solution */}
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                            Notes / Solution *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={8}
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm resize-none"
                            placeholder="Write your solution, approach, time complexity, notes... (Markdown supported)"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                            placeholder="Array, Two Pointers, Revise (comma-separated)"
                        />
                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                            Tip: Add "Revise" tag to mark problems that need revision
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors uppercase text-xs font-mono tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-primary-500 text-slate-900 hover:bg-primary-400 transition-colors uppercase text-xs font-mono tracking-wider font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Saving...' : editingProblem ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

