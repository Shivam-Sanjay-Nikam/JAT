
import React, { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { ResourceList } from '../components/ResourceList'
import { ResourceForm } from '../components/ResourceForm'
import { NoteViewer } from '../components/NoteViewer'
import { useResources } from '../hooks/useResources'
import { Resource } from '../types'
import { BookOpen, FileText, Link as LinkIcon, StickyNote } from 'lucide-react'

export const Resources: React.FC = () => {
    const {
        resources,
        loading,
        filterType,
        setFilterType,
        addResource,
        updateResource,
        deleteResource,
        uploadPDF,
        getPDFUrl,
        counts
    } = useResources()

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingResource, setEditingResource] = useState<Resource | null>(null)
    const [viewingNote, setViewingNote] = useState<Resource | null>(null)

    const handleAddClick = () => {
        setEditingResource(null)
        setIsFormOpen(true)
    }

    const handleEdit = (resource: Resource) => {
        setEditingResource(resource)
        setIsFormOpen(true)
    }

    const handleFormSubmit = async (resourceData: Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (editingResource) {
            await updateResource(editingResource.id, resourceData)
        } else {
            await addResource(resourceData)
        }
        setIsFormOpen(false)
        setEditingResource(null)
    }

    const handleView = (resource: Resource) => {
        if (resource.type === 'PDF') {
            const url = getPDFUrl(resource.content)
            window.open(url, '_blank')
        } else if (resource.type === 'LINK') {
            window.open(resource.content, '_blank')
        } else if (resource.type === 'NOTE') {
            setViewingNote(resource)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="border-b border-slate-800 pb-6 mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-6 h-6 text-primary-500" />
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-[Orbitron] uppercase tracking-[0.2em]">
                            Resource_Vault
                        </h1>
                    </div>
                    <p className="text-primary-400 font-mono text-xs tracking-wider">
                        &gt; STORE AND ORGANIZE YOUR STUDY MATERIALS
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-primary-500" />
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total</span>
                            </div>
                            <div className="text-2xl font-bold text-white font-[Orbitron]">
                                {counts.all}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-red-500/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-red-400" />
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">PDFs</span>
                            </div>
                            <div className="text-2xl font-bold text-white font-[Orbitron]">
                                {counts.pdf}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-blue-500/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <LinkIcon className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Links</span>
                            </div>
                            <div className="text-2xl font-bold text-white font-[Orbitron]">
                                {counts.link}
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-yellow-500/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <StickyNote className="w-4 h-4 text-yellow-400" />
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Notes</span>
                            </div>
                            <div className="text-2xl font-bold text-white font-[Orbitron]">
                                {counts.note}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resource List */}
                <ResourceList
                    resources={resources}
                    loading={loading}
                    filterType={filterType}
                    onFilterChange={setFilterType}
                    onAddClick={handleAddClick}
                    onEdit={handleEdit}
                    onDelete={deleteResource}
                    onView={handleView}
                    counts={counts}
                />
            </main>

            {/* Resource Form Modal */}
            <ResourceForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false)
                    setEditingResource(null)
                }}
                onSubmit={handleFormSubmit}
                onUploadPDF={uploadPDF}
                editingResource={editingResource}
            />

            {/* Note Viewer Modal */}
            <NoteViewer
                isOpen={!!viewingNote}
                note={viewingNote}
                onClose={() => setViewingNote(null)}
            />
        </div>
    )
}
