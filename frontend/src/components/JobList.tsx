
import React, { useState } from 'react'
import { useJobs } from '../hooks/useJobs'
import { JobCard } from './JobCard'
import { JobForm } from './JobForm'
import { Plus, Search, Filter } from 'lucide-react'
import { JobApplication, ApplicationStatus } from '../types'

export const JobList: React.FC = () => {
    const { jobs, loading, addJob, updateJob, deleteJob } = useJobs()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingJob, setEditingJob] = useState<JobApplication | undefined>(undefined)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'ALL'>('ALL')

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.company.toLowerCase().includes(search.toLowerCase()) ||
            job.role.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filterStatus === 'ALL' || job.application_status === filterStatus
        return matchesSearch && matchesFilter
    })

    const handleCreate = async (data: Partial<JobApplication>, resume?: File, passwordRaw?: string) => {
        await addJob(data, resume, passwordRaw)
    }

    const handleUpdate = async (data: Partial<JobApplication>, resume?: File, passwordRaw?: string) => {
        if (editingJob) {
            // If we have a resume file, we might need logic to replace it, 
            // but simplistic updateJob currently just takes fields. 
            // The addJob logic handles upload inside hook, we might need similar logic for update.
            // For now, let's assume we just update text fields in this MVP unless I hook up re-upload.
            // NOTE: Hook updateJob supports partial updates.
            await updateJob(editingJob.id, data)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
                    <p className="text-slate-400">Track and manage your job search journey.</p>
                </div>
                <button
                    onClick={() => { setEditingJob(undefined); setIsFormOpen(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                        className="input-field pl-10"
                        placeholder="Search companies or roles..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1">
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        All
                    </button>
                    {Object.values(ApplicationStatus).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === status ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="h-64 rounded-xl bg-slate-900/50 animate-pulse border border-slate-800" />
                    ))
                ) : filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onEdit={(job) => { setEditingJob(job); setIsFormOpen(true); }}
                            onDelete={deleteJob}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-xl text-slate-300 font-medium">No jobs found</p>
                        <p className="text-slate-500">Try adjusting your filters or add a new application.</p>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <JobForm
                    initialData={editingJob}
                    onSubmit={editingJob ? handleUpdate : handleCreate}
                    onClose={() => { setIsFormOpen(false); setEditingJob(undefined); }}
                />
            )}
        </div>
    )
}
