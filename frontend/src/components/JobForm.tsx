
import React, { useState, useEffect } from 'react'
import { JobApplication, ApplicationStatus } from '../types'
import { FileUpload } from './FileUpload'
import { X } from 'lucide-react'

interface JobFormProps {
    initialData?: JobApplication
    onSubmit: (data: Partial<JobApplication>, resume?: File, passwordRaw?: string) => Promise<void>
    onClose: () => void
}

export const JobForm: React.FC<JobFormProps> = ({ initialData, onSubmit, onClose }) => {
    const [formData, setFormData] = useState<Partial<JobApplication>>({
        company: '',
        role: '',
        application_status: ApplicationStatus.APPLIED,
        job_link: '',
        email_used: '',
        location: '',
        referral: '',
        note: '',
    })
    const [passwordRaw, setPasswordRaw] = useState('')
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSubmit(formData, resumeFile || undefined, passwordRaw || undefined)
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? 'Edit Application' : 'New Application'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Company</label>
                            <input
                                required
                                className="input-field"
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Google, Amazon, Startup Inc."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Role</label>
                            <input
                                required
                                className="input-field"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                placeholder="Software Engineer"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Status</label>
                        <div className="flex gap-2 flex-wrap">
                            {Object.values(ApplicationStatus).map(status => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, application_status: status })}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${formData.application_status === status
                                        ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/25'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Link</label>
                        <input
                            className="input-field"
                            value={formData.job_link || ''}
                            onChange={e => setFormData({ ...formData, job_link: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Email Used</label>
                            <input
                                type="email"
                                className="input-field"
                                value={formData.email_used || ''}
                                onChange={e => setFormData({ ...formData, email_used: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                {initialData ? 'Update Password (Optional)' : 'Password Used (Encrypted)'}
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                value={passwordRaw}
                                onChange={e => setPasswordRaw(e.target.value)}
                                placeholder={initialData ? "Leave blank to keep unchanged" : "Password to account"}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Location</label>
                            <input
                                className="input-field"
                                value={formData.location || ''}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Remote, NYC, SF"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Referral</label>
                            <input
                                className="input-field"
                                value={formData.referral || ''}
                                onChange={e => setFormData({ ...formData, referral: e.target.value })}
                                placeholder="Referrer name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Resume (PDF)</label>
                        <FileUpload
                            onFileSelect={setResumeFile}
                            selectedFile={resumeFile}
                            accept=".pdf"
                        />
                        {initialData?.resume_url && !resumeFile && (
                            <p className="text-xs text-slate-500">Currently has a resume uploaded.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Notes</label>
                        <textarea
                            className="input-field min-h-[100px]"
                            value={formData.note || ''}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                            placeholder="Any additional thoughts..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
