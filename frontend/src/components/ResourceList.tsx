
import React, { useState } from 'react'
import { Resource, ResourceType } from '../types'
import { ResourceCard } from './ResourceCard'
import { Plus, Search, Grid3x3, List } from 'lucide-react'

interface ResourceListProps {
    resources: Resource[]
    loading: boolean
    filterType: ResourceType | 'ALL'
    onFilterChange: (type: ResourceType | 'ALL') => void
    onAddClick: () => void
    onEdit: (resource: Resource) => void
    onDelete: (id: string) => void
    onView: (resource: Resource) => void
    counts: {
        all: number
        pdf: number
        link: number
        note: number
    }
}

export const ResourceList: React.FC<ResourceListProps> = ({
    resources,
    loading,
    filterType,
    onFilterChange,
    onAddClick,
    onEdit,
    onDelete,
    onView,
    counts
}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Filter resources by search query
    const filteredResources = resources.filter(resource => {
        const matchesSearch =
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesSearch
    })

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="border-b border-slate-800">
                <div className="flex items-center gap-4 overflow-x-auto">
                    <button
                        onClick={() => onFilterChange('ALL')}
                        className={`px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${filterType === 'ALL'
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-slate-400'
                            }`}
                    >
                        All ({counts.all})
                    </button>
                    <button
                        onClick={() => onFilterChange('PDF')}
                        className={`px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${filterType === 'PDF'
                                ? 'border-red-500 text-red-400'
                                : 'border-transparent text-slate-500 hover:text-slate-400'
                            }`}
                    >
                        PDFs ({counts.pdf})
                    </button>
                    <button
                        onClick={() => onFilterChange('LINK')}
                        className={`px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${filterType === 'LINK'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-400'
                            }`}
                    >
                        Links ({counts.link})
                    </button>
                    <button
                        onClick={() => onFilterChange('NOTE')}
                        className={`px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${filterType === 'NOTE'
                                ? 'border-yellow-500 text-yellow-400'
                                : 'border-transparent text-slate-500 hover:text-slate-400'
                            }`}
                    >
                        Notes ({counts.note})
                    </button>
                </div>
            </div>

            {/* Search and Actions Bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search resources..."
                        className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                    />
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-slate-800">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 transition-colors ${viewMode === 'grid'
                                ? 'bg-primary-500 text-slate-900'
                                : 'bg-slate-900 text-slate-500 hover:text-slate-400'
                            }`}
                        title="Grid view"
                    >
                        <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 transition-colors ${viewMode === 'list'
                                ? 'bg-primary-500 text-slate-900'
                                : 'bg-slate-900 text-slate-500 hover:text-slate-400'
                            }`}
                        title="List view"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* Add Button */}
                <button
                    onClick={onAddClick}
                    className="px-4 py-2 bg-primary-500 text-slate-900 hover:bg-primary-400 transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Resources Grid/List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredResources.length === 0 ? (
                <div className="border border-slate-800 border-dashed p-12 text-center">
                    <div className="text-slate-600 mb-2">
                        <Search className="w-12 h-12 mx-auto mb-3" />
                    </div>
                    <p className="text-slate-400 font-mono text-sm mb-1">
                        {searchQuery ? 'No resources found matching your search' : 'No resources yet'}
                    </p>
                    <p className="text-slate-600 font-mono text-xs">
                        {searchQuery ? 'Try a different search term' : 'Click "Add" to create your first resource'}
                    </p>
                </div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-3'
                }>
                    {filteredResources.map(resource => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onView={onView}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
