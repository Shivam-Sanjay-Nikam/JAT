
import React from 'react'
import { Resource } from '../types'
import { FileText, Link as LinkIcon, StickyNote, ExternalLink, Pencil, Trash2, Download, Eye } from 'lucide-react'

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
                return 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
            case 'LINK':
                return 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50'
            case 'NOTE':
                return 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50'
        }
    }

    return (
        <div
            className={`border ${getTypeColor()} p-4 transition-all group relative overflow-hidden flex items-center gap-4`}
        >
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex items-center gap-4 flex-1">
                {/* Icon and Type */}
                <div className="flex items-center gap-3">
                    {getIcon()}
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider min-w-[40px]">
                        {resource.type}
                    </span>
                </div>

                {/* Title and Description */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                        {resource.title}
                    </h3>
                    {resource.description && (
                        <p className="text-slate-500 text-xs mt-0.5 truncate">
                            {resource.description}
                        </p>
                    )}
                </div>

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

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                    {resource.type === 'PDF' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onView(resource)
                            }}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            title="Download PDF"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    )}
                    {resource.type === 'LINK' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                window.open(resource.content, '_blank')
                            }}
                            className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                            title="Open link"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                    {resource.type === 'NOTE' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onView(resource)
                            }}
                            className="p-2 text-slate-500 hover:text-yellow-400 transition-colors"
                            title="View note"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(resource)
                        }}
                        className="p-2 text-slate-500 hover:text-primary-400 transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(resource.id)
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
