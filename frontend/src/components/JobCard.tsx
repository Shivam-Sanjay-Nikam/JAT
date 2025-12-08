
import React, { useState } from 'react'
import { JobApplication, ApplicationStatus } from '../types'
import { Calendar, MapPin, Link as LinkIcon, FileText, Lock, Edit2, Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'
import { supabase } from '../lib/supabase'

interface JobCardProps {
    job: JobApplication
    onEdit: (job: JobApplication) => void
    onDelete: (id: string) => void
}

const statusColors = {
    [ApplicationStatus.APPLIED]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [ApplicationStatus.OA]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    [ApplicationStatus.INTERVIEW]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [ApplicationStatus.REJECTED]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [ApplicationStatus.OFFER]: 'bg-green-500/10 text-green-400 border-green-500/20',
}

export const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete }) => {
    const [showPassword, setShowPassword] = useState(false)
    const [passwordPlain, setPasswordPlain] = useState<string | null>(null)
    const [passwordLoading, setPasswordLoading] = useState(false)

    const handleDownloadResume = async () => {
        if (!job.resume_url) return
        const { data } = await supabase.storage
            .from('resumes')
            .createSignedUrl(job.resume_url, 60) // 1 minute expiry

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank')
        }
    }

    const handleTogglePassword = async () => {
        if (!job.password_used) return
        const next = !showPassword
        setShowPassword(next)

        if (next && !passwordPlain && !passwordLoading) {
            setPasswordLoading(true)
            try {
                const { data, error } = await supabase.functions.invoke('decrypt-password', {
                    body: { encrypted: job.password_used }
                })
                if (error) throw error
                setPasswordPlain(data?.password || '')
            } catch (err) {
                console.error('Failed to decrypt password', err)
            } finally {
                setPasswordLoading(false)
            }
        }
    }

    return (
        <div className="glass-panel rounded-xl p-6 transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary-500/5 group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-1">{job.role}</h3>
                    <p className="text-slate-400 font-medium text-lg">{job.company}</p>
                </div>
                <div className={clsx("px-3 py-1 rounded-full text-xs font-semibold border", statusColors[job.application_status])}>
                    {job.application_status}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                    {job.location && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                        </div>
                    )}
                    {job.job_link && (
                        <a href={job.job_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-colors w-fit">
                            <LinkIcon className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">{job.job_link}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Applied {format(new Date(job.created_at), 'MMM d, yyyy')}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {job.email_used && (
                        <div className="text-sm text-slate-400">
                            <span className="text-slate-500">Email:</span> {job.email_used}
                        </div>
                    )}
                    {job.password_used && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Lock className="w-4 h-4 text-slate-500" />
                            <div className="relative group/pass">
                                <span
                                    className="font-mono bg-slate-800 px-2 py-0.5 rounded cursor-pointer select-all flex items-center gap-2"
                                    onClick={handleTogglePassword}
                                >
                                    {passwordLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                                    ) : showPassword ? (
                                        passwordPlain || '(unable to decrypt)'
                                    ) : (
                                        '••••••••'
                                    )}
                                </span>
                                <span className="absolute left-full ml-2 text-xs bg-slate-800 px-2 py-1 rounded opacity-0 group-hover/pass:opacity-100 transition-opacity whitespace-nowrap">
                                    {showPassword ? 'Decrypted (only you)' : 'Click to decrypt'}
                                </span>
                            </div>
                        </div>
                    )}
                    {job.resume_url && (
                        <button
                            onClick={handleDownloadResume}
                            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            <span>View Resume</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center">
                <p className="text-sm text-slate-500 italic max-w-[70%] truncate">
                    {job.note || "No notes"}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(job)}
                        className="p-2 text-slate-400 hover:text-primary-400 hover:bg-primary-400/10 rounded-lg transition-all"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(job.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
