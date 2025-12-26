import React, { useState } from 'react'
import { Problem } from '../hooks/useProblems'
import { ProblemCard } from './ProblemCard'
import { Plus, Search, Filter } from 'lucide-react'

interface ProblemListProps {
    problems: Problem[]
    loading: boolean
    onAddClick: () => void
    onToggleComplete: (id: string) => void
    onToggleRevise: (id: string) => void
    onEdit: (problem: Problem) => void
    onDelete: (id: string) => void
    onView: (problem: Problem) => void
    stats: {
        total: number
        completed: number
        needsRevision: number
        inProgress: number
    }
}

type FilterType = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NEEDS_REVISION'

export const ProblemList: React.FC<ProblemListProps> = ({
    problems,
    loading,
    onAddClick,
    onToggleComplete,
    onToggleRevise,
    onEdit,
    onDelete,
    onView,
    stats
}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<FilterType>('ALL')

    // Filter problems based on search and filter
    const filteredProblems = problems.filter(problem => {
        // Search filter
        const matchesSearch =
            problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            problem.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            problem.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        if (!matchesSearch) return false

        // Status filter
        switch (filterType) {
            case 'COMPLETED':
                return problem.isCompleted
            case 'IN_PROGRESS':
                return !problem.isCompleted
            case 'NEEDS_REVISION':
                return problem.needsRevision
            default:
                return true
        }
    })

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="border-b border-slate-800">
                <div className="flex items-center gap-4 overflow-x-auto">
                    <button
                        onClick={() => setFilterType('ALL')}
                        className={`px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${
                            filterType === 'ALL'
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-slate-400'
                        }`}
                    >
                        All ({stats.total})
                    </button>
                    <button
                        onClick={() => setFilterType('IN_PROGRESS')}
                        className={`px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${
                            filterType === 'IN_PROGRESS'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-400'
                        }`}
                    >
                        In Progress ({stats.inProgress})
                    </button>
                    <button
                        onClick={() => setFilterType('COMPLETED')}
                        className={`px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${
                            filterType === 'COMPLETED'
                                ? 'border-green-500 text-green-400'
                                : 'border-transparent text-slate-500 hover:text-slate-400'
                        }`}
                    >
                        Completed ({stats.completed})
                    </button>
                    <button
                        onClick={() => setFilterType('NEEDS_REVISION')}
                        className={`px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${
                            filterType === 'NEEDS_REVISION'
                                ? 'border-yellow-500 text-yellow-400'
                                : 'border-transparent text-slate-500 hover:text-slate-400'
                        }`}
                    >
                        Needs Revision ({stats.needsRevision})
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
                        placeholder="Search problems..."
                        className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                    />
                </div>

                {/* Add Button */}
                <button
                    onClick={onAddClick}
                    className="px-4 py-2 bg-primary-500 text-slate-900 hover:bg-primary-400 transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold"
                >
                    <Plus className="w-4 h-4" />
                    Add Problem
                </button>
            </div>

            {/* Problems List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredProblems.length === 0 ? (
                <div className="border border-slate-800 border-dashed p-12 text-center">
                    <div className="text-slate-600 mb-2">
                        <Search className="w-12 h-12 mx-auto mb-3" />
                    </div>
                    <p className="text-slate-400 font-mono text-sm mb-1">
                        {searchQuery || filterType !== 'ALL' 
                            ? 'No problems found matching your filters' 
                            : 'No problems yet'}
                    </p>
                    <p className="text-slate-600 font-mono text-xs">
                        {searchQuery || filterType !== 'ALL'
                            ? 'Try adjusting your search or filters'
                            : 'Click "Add Problem" to start tracking your DSA progress'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredProblems.map(problem => (
                        <ProblemCard
                            key={problem.id}
                            problem={problem}
                            onToggleComplete={onToggleComplete}
                            onToggleRevise={onToggleRevise}
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

