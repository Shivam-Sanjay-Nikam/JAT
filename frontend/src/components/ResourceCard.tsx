
import React from 'react'
import { Resource } from '../types'
import { FileText, Link as LinkIcon, StickyNote, ExternalLink, Pencil, Trash2, Download } from 'lucide-react'

interface ResourceCardProps {
    resource: Resource
    onEdit: (resource: Resource) => void
    onDelete: (id: string) => void
    onView: (resource: Resource) => void
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onEdit, onDelete, onView }) => {
    const getIcon = () => {
        switch (resource.type) {
            case 'PDF':
                return <FileText className="w-5 h-5 text-red-400" />
            case 'LINK':
                return <LinkIcon className="w-5 h-5 text-blue-400" />
            case 'NOTE':
                return <StickyNote className="w-5 h-5 text-yellow-400" />
        }
    }

    const getTypeColor = () => {
        switch (resource.type) {
            case 'PDF':
                return 'border-red-500/30 bg-red-500/5'
            case 'LINK':
                return 'border-blue-500/30 bg-blue-500/5'
            case 'NOTE':
                return 'border-yellow-500/30 bg-yellow-500/5'
        }
    }

    return (
        <div
            className={`border ${getTypeColor()} p-4 hover:border-primary-500/50 transition-all cursor-pointer group relative overflow-hidden`}
            onClick={() => onView(resource)}
        >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {getIcon()}
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                            {resource.type}
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {resource.type === 'PDF' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onView(resource)
                                }}
                                className="p-1.5 text-slate-500 hover:text-primary-400 transition-colors"
                                title="Download PDF"
                            >
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {resource.type === 'LINK' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(resource.content, '_blank')
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
                                title="Open link"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit(resource)
                            }}
                            className="p-1.5 text-slate-500 hover:text-primary-400 transition-colors"
                            title="Edit"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Delete this resource?')) {
                                    onDelete(resource.id)
                                }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold mb-2 line-clamp-2">
                    {resource.title}
                </h3>

                {/* Description */}
                {resource.description && (
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                        {resource.description}
                    </p>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {resource.tags.slice(0, 3).map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 uppercase tracking-wider"
                            >
                                {tag}
                            </span>
                        ))}
                        {resource.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-[10px] font-mono text-slate-500">
                                +{resource.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer - Date */}
                <div className="mt-3 pt-3 border-t border-slate-800">
                    <span className="text-[9px] font-mono text-slate-600">
                        {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    )
}
