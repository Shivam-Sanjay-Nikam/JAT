import React, { useState, useMemo } from 'react'
import { Navbar } from '../components/Navbar'
import { useResources } from '../hooks/useResources'
import { Resource } from '../types'
import { DSAQuestionCard } from '../components/DSAQuestionCard'
import { DSAQuestionForm } from '../components/DSAQuestionForm'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Code2, Plus, CheckCircle2, RotateCcw, Filter } from 'lucide-react'

export const DSASheet: React.FC = () => {
    const {
        resources,
        loading,
        addResource,
        updateResource,
        deleteResource
    } = useResources()

    // Filter resources to only show NOTE type (we'll use NOTE type for DSA questions)
    const dsaQuestions = useMemo(() => {
        return resources.filter(r => r.type === 'NOTE' && r.tags?.includes('DSA'))
    }, [resources])

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Resource | null>(null)
    const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'REVISE'>('ALL')

    // Calculate statistics
    const stats = useMemo(() => {
        const total = dsaQuestions.length
        const completed = dsaQuestions.filter(q => q.tags?.includes('Completed')).length
        const needsRevise = dsaQuestions.filter(q => q.tags?.includes('Revise')).length
        const pending = total - completed
        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

        return { total, completed, pending, needsRevise, completionPercentage }
    }, [dsaQuestions])

    // Filter questions based on status
    const filteredQuestions = useMemo(() => {
        if (filterStatus === 'ALL') return dsaQuestions
        if (filterStatus === 'COMPLETED') return dsaQuestions.filter(q => q.tags?.includes('Completed'))
        if (filterStatus === 'PENDING') return dsaQuestions.filter(q => !q.tags?.includes('Completed'))
        if (filterStatus === 'REVISE') return dsaQuestions.filter(q => q.tags?.includes('Revise'))
        return dsaQuestions
    }, [dsaQuestions, filterStatus])

    const handleAddClick = () => {
        setEditingQuestion(null)
        setIsFormOpen(true)
    }

    const handleEdit = (question: Resource) => {
        setEditingQuestion(question)
        setIsFormOpen(true)
    }

    const handleFormSubmit = async (resourceData: Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        // Ensure DSA tag is present
        const tags = resourceData.tags || []
        if (!tags.includes('DSA')) {
            tags.push('DSA')
        }

        if (editingQuestion) {
            await updateResource(editingQuestion.id, { ...resourceData, tags })
        } else {
            await addResource({ ...resourceData, tags })
        }
        setIsFormOpen(false)
        setEditingQuestion(null)
    }

    const handleDeleteClick = (id: string) => {
        setDeletingQuestionId(id)
    }

    const handleConfirmDelete = async () => {
        if (deletingQuestionId) {
            await deleteResource(deletingQuestionId)
            setDeletingQuestionId(null)
        }
    }

    const handleToggleComplete = async (question: Resource) => {
        const tags = [...(question.tags || [])]
        const isCompleted = tags.includes('Completed')

        if (isCompleted) {
            // Remove Completed tag
            const index = tags.indexOf('Completed')
            tags.splice(index, 1)
        } else {
            // Add Completed tag
            tags.push('Completed')
        }

        await updateResource(question.id, { tags })
    }

    const handleToggleRevise = async (question: Resource) => {
        const tags = [...(question.tags || [])]
        const needsRevise = tags.includes('Revise')

        if (needsRevise) {
            // Remove Revise tag
            const index = tags.indexOf('Revise')
            tags.splice(index, 1)
        } else {
            // Add Revise tag
            tags.push('Revise')
        }

        await updateResource(question.id, { tags })
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="border-b border-slate-800 pb-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                        <div className="flex items-center gap-3">
                            <Code2 className="w-6 h-6 text-primary-500" />
                            <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-[Orbitron] uppercase tracking-[0.2em]">
                                DSA_Sheet
                            </h1>
                        </div>
                    </div>
                    <p className="text-primary-400 font-mono text-xs tracking-wider">
                        &gt; TRACK YOUR CODING PRACTICE AND REVISION
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Code2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500" />
                                <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-[Orbitron]">
                                {stats.total}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-green-500/20 p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                                <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-wider">Completed</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-[Orbitron]">
                                {stats.completed}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-yellow-500/20 p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                                <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-wider">Pending</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-[Orbitron]">
                                {stats.pending}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-orange-500/20 p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                                <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 uppercase tracking-wider">Revise</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white font-[Orbitron]">
                                {stats.needsRevise}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Progress</span>
                            <span className="text-xs font-mono text-primary-400 font-bold">{stats.completionPercentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${stats.completionPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs and Add Button Row */}
                <div className="mb-6 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
                    {/* Filter Tabs */}
                    <div className="border-b border-slate-800 sm:border-b-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-max">
                            <button
                                onClick={() => setFilterStatus('ALL')}
                                className={`px-3 sm:px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${filterStatus === 'ALL'
                                    ? 'border-primary-500 text-primary-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-400'
                                    }`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilterStatus('COMPLETED')}
                                className={`px-3 sm:px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${filterStatus === 'COMPLETED'
                                    ? 'border-green-500 text-green-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-400'
                                    }`}
                            >
                                Completed ({stats.completed})
                            </button>
                            <button
                                onClick={() => setFilterStatus('PENDING')}
                                className={`px-3 sm:px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${filterStatus === 'PENDING'
                                    ? 'border-yellow-500 text-yellow-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-400'
                                    }`}
                            >
                                Pending ({stats.pending})
                            </button>
                            <button
                                onClick={() => setFilterStatus('REVISE')}
                                className={`px-3 sm:px-4 py-2 border-b-2 transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap ${filterStatus === 'REVISE'
                                    ? 'border-orange-500 text-orange-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-400'
                                    }`}
                            >
                                <Filter className="w-3 h-3 inline mr-1" />
                                Revise ({stats.needsRevise})
                            </button>
                        </div>
                    </div>

                    {/* Add Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddClick}
                            className="px-4 py-2 bg-primary-500 text-slate-900 hover:bg-primary-400 transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold rounded sm:rounded-none w-full sm:w-auto justify-center"
                        >
                            <Plus className="w-4 h-4" />
                            Add Question
                        </button>
                    </div>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="border border-slate-800 border-dashed p-12 text-center">
                        <div className="text-slate-600 mb-2">
                            <Code2 className="w-12 h-12 mx-auto mb-3" />
                        </div>
                        <p className="text-slate-400 font-mono text-sm mb-1">
                            {filterStatus !== 'ALL' ? `No ${filterStatus.toLowerCase()} questions` : 'No questions yet'}
                        </p>
                        <p className="text-slate-600 font-mono text-xs">
                            {filterStatus === 'ALL' ? 'Click "Add Question" to start tracking your DSA practice' : 'Try a different filter'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredQuestions.map(question => (
                            <DSAQuestionCard
                                key={question.id}
                                question={question}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onToggleComplete={handleToggleComplete}
                                onToggleRevise={handleToggleRevise}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Question Form Modal */}
            <DSAQuestionForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false)
                    setEditingQuestion(null)
                }}
                onSubmit={handleFormSubmit}
                editingQuestion={editingQuestion}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deletingQuestionId}
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingQuestionId(null)}
            />
        </div>
    )
}
