import React, { useState, useEffect } from 'react'
import { Resource, ResourceType } from '../types'
import { X, Upload, Link as LinkIcon, FileText, StickyNote } from 'lucide-react'

interface ResourceFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (resource: Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
    onUploadPDF: (file: File) => Promise<string>
    editingResource?: Resource | null
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onUploadPDF,
    editingResource
}) => {
    const [type, setType] = useState<ResourceType>('LINK')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Update form values when editingResource changes
    useEffect(() => {
        if (editingResource) {
            setType(editingResource.type)
            setTitle(editingResource.title)
            setContent(editingResource.content)
            setDescription(editingResource.description || '')
            setTags(editingResource.tags?.join(', ') || '')
        } else {
            // Reset form when not editing
            setType('LINK')
            setTitle('')
            setContent('')
            setDescription('')
            setTags('')
            setSelectedFile(null)
        }
    }, [editingResource])

    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file)
            if (!title) {
                setTitle(file.name.replace('.pdf', ''))
            }
        } else {
            alert('Please select a PDF file')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)

        try {
            let finalContent = content

            // If PDF type and file selected, upload it
            if (type === 'PDF' && selectedFile) {
                finalContent = await onUploadPDF(selectedFile)
            }

            // Validate content
            if (!finalContent) {
                alert('Please provide content for the resource')
                setUploading(false)
                return
            }

            await onSubmit({
                title,
                type,
                content: finalContent,
                description: description || undefined,
                tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
            })

            // Reset form
            setTitle('')
            setContent('')
            setDescription('')
            setTags('')
            setSelectedFile(null)
            onClose()
        } catch (error) {
            console.error('Error submitting resource:', error)
            alert('Failed to save resource')
        } finally {
            setUploading(false)
        }
    }

    const resetForm = () => {
        setTitle('')
        setContent('')
        setDescription('')
        setTags('')
        setSelectedFile(null)
        setType('LINK')
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
                        {editingResource ? 'Edit_Resource' : 'New_Resource'}
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
                    {/* Type Selector */}
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                            Resource Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setType('PDF')}
                                className={`p-3 border transition-all flex flex-col items-center gap-2 ${type === 'PDF'
                                    ? 'border-red-500 bg-red-500/10 text-red-400'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <FileText className="w-5 h-5" />
                                <span className="text-xs font-mono">PDF</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('LINK')}
                                className={`p-3 border transition-all flex flex-col items-center gap-2 ${type === 'LINK'
                                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <LinkIcon className="w-5 h-5" />
                                <span className="text-xs font-mono">LINK</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('NOTE')}
                                className={`p-3 border transition-all flex flex-col items-center gap-2 ${type === 'NOTE'
                                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <StickyNote className="w-5 h-5" />
                                <span className="text-xs font-mono">NOTE</span>
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                            placeholder="Enter resource title..."
                        />
                    </div>

                    {/* Content - Dynamic based on type */}
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                            {type === 'PDF' ? 'Upload PDF *' : type === 'LINK' ? 'URL *' : 'Content *'}
                        </label>

                        {type === 'PDF' && (
                            <div className="border-2 border-dashed border-slate-700 hover:border-primary-500 transition-colors p-6 text-center">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="pdf-upload"
                                />
                                <label htmlFor="pdf-upload" className="cursor-pointer">
                                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400 mb-1">
                                        {selectedFile ? selectedFile.name : 'Click to upload PDF'}
                                    </p>
                                    <p className="text-xs text-slate-600 font-mono">
                                        Max size: 10MB
                                    </p>
                                </label>
                            </div>
                        )}

                        {type === 'LINK' && (
                            <input
                                type="url"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                                placeholder="https://example.com"
                            />
                        )}

                        {type === 'NOTE' && (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={6}
                                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm resize-none"
                                placeholder="Enter your notes here... (Markdown supported)"
                            />
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm resize-none"
                            placeholder="Optional description..."
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
                            placeholder="javascript, interview, algorithms (comma-separated)"
                        />
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
                            disabled={uploading}
                            className="flex-1 px-4 py-2 bg-primary-500 text-slate-900 hover:bg-primary-400 transition-colors uppercase text-xs font-mono tracking-wider font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Saving...' : editingResource ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
