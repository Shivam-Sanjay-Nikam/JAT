
import React, { useState } from 'react'
import { useJobs } from '../hooks/useJobs'
import { JobCard } from './JobCard'
import { JobForm } from './JobForm'
import { Plus, Search, Filter } from 'lucide-react'
import { JobApplication, ApplicationStatus } from '../types'

// ... imports ...

export const JobList: React.FC = () => {
    // ... state ...
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
            await updateJob(editingJob.id, data)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-[Orbitron] uppercase tracking-widest mb-0.5">
                        Mission_Control
                    </h1>
                    <p className="text-primary-400 font-mono text-[10px] tracking-wider">
                        &gt; TRACKING {jobs.length} ACTIVE_PROTOCOLS...
                    </p>
                </div>
                <button
                    onClick={() => { setEditingJob(undefined); setIsFormOpen(true); }}
                    className="btn-primary flex items-center gap-1.5 text-xs py-2 px-4"
                >
                    <Plus className="w-4 h-4" />
                    <span>Init_New_Protocol</span>
                </button>
            </div>

            {isFormOpen && (
                <JobForm
                    initialData={editingJob}
                    onSubmit={editingJob ? handleUpdate : handleCreate}
                    onClose={() => { setIsFormOpen(false); setEditingJob(undefined); }}
                />
            )}

            <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 w-4 h-4" />
                    <input
                        className="input-field pl-9 text-xs py-2.5"
                        placeholder="SEARCH_DATABASE..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {/* Techy Filter Bar */}
                <div className="flex flex-wrap gap-1 bg-slate-950/50 p-1 border border-slate-800 rounded-none w-full lg:w-auto">
                    <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all flex-1 lg:flex-none text-center ${filterStatus === 'ALL' ? 'bg-primary-500 text-slate-900' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    >
                        [ ALL_DATA ]
                    </button>
                    {Object.values(ApplicationStatus).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all flex-1 lg:flex-none text-center ${filterStatus === status ? 'bg-primary-500 text-slate-900' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="h-64 rounded-sm bg-slate-900/50 animate-pulse border border-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                    ))
                ) : filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onEdit={(job) => { setEditingJob(job); setIsFormOpen(true); }}
                            onDelete={deleteJob}
                            onStatusChange={(id, status) => updateJob(id, { application_status: status })}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center border border-slate-800 border-dashed rounded-lg bg-slate-900/20">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                            <Filter className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-xl text-primary-400 font-[Orbitron] tracking-widest uppercase mb-2">Null_Result</p>
                        <p className="text-slate-500 font-mono text-xs">ADJUST_FILTERS OR INIT_NEW_PROTOCOL</p>
                    </div>
                )}
            </div>
        </div>
    )
}
