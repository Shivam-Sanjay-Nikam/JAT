import React, { useState } from 'react'
import { JobApplication, ApplicationStatus } from '../types'
import { Calendar, MapPin, Link as LinkIcon, FileText, Lock, Edit2, Trash2, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'
import { supabase } from '../lib/supabase'

interface JobCardProps {
    job: JobApplication
    onEdit: (job: JobApplication) => void
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: ApplicationStatus) => Promise<void>
}

const statusColors = {
    [ApplicationStatus.APPLIED]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [ApplicationStatus.OA]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    [ApplicationStatus.INTERVIEW]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [ApplicationStatus.REJECTED]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [ApplicationStatus.OFFER]: 'bg-green-500/10 text-green-400 border-green-500/20',
}

// ... imports existing ...

export const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete, onStatusChange }) => {
    // ... state ...
    const [showPassword, setShowPassword] = useState(false)
    const [passwordPlain, setPasswordPlain] = useState<string | null>(null)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [statusLoading, setStatusLoading] = useState(false)

    // ... handlers ...
    const handleDownloadResume = async () => {
        if (!job.resume_url) return
        const { data } = await supabase.storage
            .from('resumes')
            .createSignedUrl(job.resume_url, 60)
        if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    }

    const handleTogglePassword = async () => {
        if (!job.password_used) return
        const next = !showPassword
        setShowPassword(next)
        if (next && !passwordPlain && !passwordLoading) {
            setPasswordLoading(true)
            try {
                const { data } = await supabase.functions.invoke('decrypt-password', {
                    body: { encrypted: job.password_used }
                })
                setPasswordPlain(data?.password || '')
            } catch (err) {
                console.error(err)
            } finally {
                setPasswordLoading(false)
            }
        }
    }

    const handleStatusChange = async (status: ApplicationStatus) => {
        if (status === job.application_status) return
        setStatusLoading(true)
        try {
            await onStatusChange(job.id, status)
        } finally {
            setStatusLoading(false)
        }
    }

    // Status Badge Helpers
    const getStatusStyle = (s: ApplicationStatus) => {
        switch (s) {
            case ApplicationStatus.OFFER: return 'text-green-400 border-green-500/50 shadow-[0_0_10px_-2px_rgba(74,222,128,0.3)]'
            case ApplicationStatus.REJECTED: return 'text-red-400 border-red-500/50'
            case ApplicationStatus.INTERVIEW: return 'text-purple-400 border-purple-500/50 shadow-[0_0_10px_-2px_rgba(192,132,252,0.3)]'
            case ApplicationStatus.OA: return 'text-yellow-400 border-yellow-500/50'
            default: return 'text-blue-400 border-blue-500/50'
        }
    }

    return (
        <div className="glass-panel rounded-sm p-0 overflow-hidden group hover:border-primary-500/50 transition-colors duration-300">
            {/* Header Bar */}
            <div className="bg-slate-900/80 p-3 border-b border-slate-700/50 flex justify-between items-start relative">
                {/* Tech Deco */}
                <div className="absolute top-0 left-0 w-1 h-3 bg-primary-500"></div>
                <div className="absolute top-0 right-0 w-3 h-1 bg-primary-500"></div>

                <div className="space-y-0.5 z-10">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider font-[Orbitron] truncate max-w-[180px]" title={job.role}>
                        {job.role}
                    </h3>
                    <div className="flex items-center gap-1.5 text-primary-400/80 text-[10px] font-mono uppercase tracking-widest">
                        <span className="w-1 h-1 bg-primary-500 rounded-full animate-pulse"></span>
                        {job.company}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    <div className={clsx("px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-wider bg-slate-950/50", getStatusStyle(job.application_status))}>
                        {job.application_status}
                    </div>
                    {/* Select wrapper for styling */}
                    <div className="relative group">
                        <select
                            value={job.application_status}
                            onChange={(e) => onStatusChange(job.id, e.target.value as ApplicationStatus)}
                            className="appearance-none bg-slate-900 border border-slate-700 text-slate-400 text-[9px] px-2 py-0.5 pr-5 cursor-pointer 
                                     hover:border-primary-500 hover:text-primary-400 focus:outline-none focus:border-primary-500 transition-all uppercase tracking-wide"
                        >
                            {Object.values(ApplicationStatus).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-2.5 h-2.5 text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3 relative">
                <div className="scanline absolute inset-0 opacity-[0.03] pointer-events-none"></div>

                {/* Data Grid */}
                <div className="grid grid-cols-1 gap-2 text-xs">
                    {/* Location & Date */}
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="w-2.5 h-2.5 text-primary-500" />
                            <span className="font-mono text-[10px]">{job.location || 'REMOTE'}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{format(new Date(job.created_at), 'yyyy.MM.dd')}</span>
                    </div>

                    {/* Link */}
                    {job.job_link && (
                        <div className="flex items-center gap-2 overflow-hidden">
                            <LinkIcon className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <a href={job.job_link} target="_blank" rel="noreferrer" className="font-mono text-xs text-primary-400 hover:text-white truncate transition-colors uppercase">
                                {job.job_link.replace('https://', '')}
                            </a>
                        </div>
                    )}

                    {/* Email */}
                    {job.email_used && (
                        <div className="font-mono text-xs text-slate-400">
                            <span className="text-slate-600 uppercase">UID:</span> {job.email_used}
                        </div>
                    )}

                    {/* Password */}
                    {job.password_used && (
                        <div className="flex items-center gap-2 font-mono text-xs bg-slate-950/50 p-2 border border-slate-800 rounded-sm">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span onClick={handleTogglePassword} className="cursor-pointer hover:text-primary-400 transition-colors select-none">
                                {passwordLoading ? 'DECRYPTING...' : showPassword ? passwordPlain : '*********'}
                            </span>
                        </div>
                    )}

                    {/* Resume */}
                    {job.resume_url && (
                        <button
                            onClick={handleDownloadResume}
                            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-primary-400 transition-colors w-fit group/btn"
                        >
                            <FileText className="w-3 h-3 group-hover/btn:text-primary-500" />
                            [VIEW_DATA_LOG]
                        </button>
                    )}
                </div>

                {/* Footer Notes & Actions */}
                <div className="pt-3 flex justify-between items-end gap-3">
                    <p className="text-[10px] text-slate-600 font-mono italic truncate max-w-[150px]">
                        {job.note ? `// ${job.note}` : '// NO_DATA'}
                    </p >

                    <div className="flex gap-1">
                        <button onClick={() => onEdit(job)} className="p-1.5 hover:bg-primary-500/20 text-slate-500 hover:text-primary-400 transition-colors rounded-sm">
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDelete(job.id)} className="p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors rounded-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div >
            </div >
        </div >
    )
}
