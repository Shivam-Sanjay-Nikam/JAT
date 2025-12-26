import React, { useState, useEffect } from 'react'
import { Resource } from '../types'
import { X, Code2 } from 'lucide-react'

interface DSAQuestionFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (resource: Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
    editingQuestion?: Resource | null
}

export const DSAQuestionForm: React.FC<DSAQuestionFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingQuestion
}) => {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [isCompleted, setIsCompleted] = useState(false)
    const [needsRevise, setNeedsRevise] = useState(false)

    // Update form values when editingQuestion changes
    useEffect(() => {
        if (editingQuestion) {
            setTitle(editingQuestion.title)
            setContent(editingQuestion.content)
            setDescription(editingQuestion.description || '')
            
            // Extract tags excluding DSA, Completed, Revise
            const otherTags = editingQuestion.tags?.filter(
                tag => tag !== 'DSA' && tag !== 'Completed' && tag !== 'Revise'
            ) || []
            setTags(otherTags.join(', '))
            
            setIsCompleted(editingQuestion.tags?.includes('Completed') || false)
            setNeedsRevise(editingQuestion.tags?.includes('Revise') || false)
        } else {
            // Reset form when not editing
            setTitle('')
            setContent('')
            setDescription('')
            setTags('')
            setIsCompleted(false)
            setNeedsRevise(false)
        }
    }, [editingQuestion])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // Build tags array
            const tagsArray: string[] = ['DSA'] // Always include DSA tag
            
            // Add other tags
            if (tags.trim()) {
                tagsArray.push(...tags.split(',').map(t => t.trim()).filter(Boolean))
            }
            
            // Add status tags
            if (isCompleted) {
                tagsArray.push('Completed')
            }
            if (needsRevise) {
                tagsArray.push('Revise')
            }

            await onSubmit({
                title,
                type: 'NOTE',
                content: content || 'No notes added yet',
                description: description || undefined,
                tags: tagsArray
            })

            // Reset form
            setTitle('')
            setContent('')
            setDescription('')
            setTags('')
            setIsCompleted(false)
            setNeedsRevise(false)
            onClose()
        } catch (error) {
            console.error('Error submitting question:', error)
            alert('Failed to save question')
        }
    }

    const resetForm = () => {
        setTitle('')
        setContent('')
        setDescription('')
        setTags('')
        setIsCompleted(false)
        setNeedsRevise(false)
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
                    <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest font-[Orbitron]">
                            {editingQuestion ? 'Edit_Question' : 'New_Question'}
                        </h2>
                    </div>
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
                            Question Title *
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
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm resize-none"
                            placeholder="Brief description or problem statement..."
                        />
                    </div>

                    {/* Notes/Content */}
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
                            placeholder="Add your solution, approach, time complexity, space complexity, notes, etc. (Markdown supported)"
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
                            placeholder="Array, String, Two Pointers (comma-separated)"
                        />
                        <p className="text-[10px] text-slate-600 font-mono mt-1">
                            Topic tags (e.g., Array, String, DP, Graph, etc.)
                        </p>
                    </div>

                    {/* Status Checkboxes */}
                    <div className="space-y-3">
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                            Status
                        </label>
                        
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={(e) => setIsCompleted(e.target.checked)}
                                className="w-4 h-4 text-green-500 bg-slate-800 border-slate-700 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-green-400 transition-colors">
                                Mark as Completed
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={needsRevise}
                                onChange={(e) => setNeedsRevise(e.target.checked)}
                                className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 focus:ring-2"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-orange-400 transition-colors">
                                Mark for Revision
                            </span>
                        </label>
                        <p className="text-[10px] text-slate-600 font-mono mt-1">
                            Questions marked for revision will be highlighted in orange
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
                            className="flex-1 px-4 py-2 bg-primary-500 text-slate-900 hover:bg-primary-400 transition-colors uppercase text-xs font-mono tracking-wider font-bold"
                        >
                            {editingQuestion ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

