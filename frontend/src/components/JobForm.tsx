
import React, { useState, useEffect } from 'react'
import { JobApplication, ApplicationStatus } from '../types'
import { FileUpload } from './FileUpload'
import { X } from 'lucide-react'

interface JobFormProps {
    initialData?: JobApplication
    onSubmit: (data: Partial<JobApplication>, resume?: File, passwordRaw?: string) => Promise<void>
    onClose: () => void
}

// ... imports ...

export const JobForm: React.FC<JobFormProps> = ({ initialData, onSubmit, onClose }) => {
    // ... state ...
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
        <div className="bg-slate-900 border border-primary-500/30 rounded-lg shadow-lg overflow-hidden">
            {/* Tech Header */}
            <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/95">
                <div>
                    <div className="text-[9px] text-primary-500 uppercase tracking-[0.2em] mb-0.5">System_Entry</div>
                    <h2 className="text-lg font-bold text-white font-[Orbitron] tracking-widest uppercase text-shadow-glow">
                        {initialData ? 'Edit_Protocol' : 'New_Protocol'}
                    </h2>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-full">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest pl-1">Target_Company</label>
                        <input
                            required
                            className="input-field group-focus-within:border-primary-500 transition-colors text-sm py-2"
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                            placeholder="ENTER_CORP_NAME"
                        />
                    </div>
                    <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest pl-1">Role_Designation</label>
                        <input
                            required
                            className="input-field group-focus-within:border-primary-500 transition-colors text-sm py-2"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            placeholder="ENTER_ROLE_ID"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest pl-1">Status_Check</label>
                    <div className="flex gap-1.5 flex-wrap">
                        {Object.values(ApplicationStatus).map(status => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setFormData({ ...formData, application_status: status })}
                                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border ${formData.application_status === status
                                    ? 'bg-primary-500/20 text-primary-400 border-primary-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.5)]'
                                    : 'bg-slate-900/50 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
                                    }`}
                                style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest pl-1">Secure_Uplink</label>
                    <input
                        className="input-field group-focus-within:border-primary-500 transition-colors text-sm py-2"
                        value={formData.job_link || ''}
                        onChange={e => setFormData({ ...formData, job_link: e.target.value })}
                        placeholder="HTTPS://..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest pl-1">User_Identity</label>
                        <input
                            type="email"
                            className="input-field group-focus-within:border-primary-500 transition-colors text-sm py-2"
                            value={formData.email_used || ''}
                            onChange={e => setFormData({ ...formData, email_used: e.target.value })}
                            placeholder="EMAIL_ADDRESS"
                        />
                    </div>
                    <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest pl-1">
                            {initialData ? 'Update_Access_Key' : 'Access_Key_Encrypted'}
                        </label>
                        <input
                            type="password"
                            className="input-field group-focus-within:border-primary-500 transition-colors text-sm py-2"
                            value={passwordRaw}
                            onChange={e => setPasswordRaw(e.target.value)}
                            placeholder={initialData ? "UNCHANGED" : "PASSWORD"}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest pl-1">Geo_Coordinates</label>
                        <input
                            className="input-field group-focus-within:border-primary-500 transition-colors text-sm py-2"
                            value={formData.location || ''}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            placeholder="CITY_STATE"
                        />
                    </div>
                    <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest pl-1">Referral_Source</label>
                        <input
                            className="input-field group-focus-within:border-primary-500 transition-colors text-sm py-2"
                            value={formData.referral || ''}
                            onChange={e => setFormData({ ...formData, referral: e.target.value })}
                            placeholder="AGENT_NAME"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-primary-500 uppercase tracking-widest pl-1">Data_Packet (Values .PDF)</label>
                    <FileUpload
                        onFileSelect={setResumeFile}
                        selectedFile={resumeFile}
                        accept=".pdf"
                    />
                    {initialData?.resume_url && !resumeFile && (
                        <p className="text-[10px] text-green-400 font-mono mt-1">&gt; EXISTING_PACKET_DETECTED</p>
                    )}
                </div>

                <div className="space-y-2 group">
                    <label className="text-xs font-bold text-primary-500 uppercase tracking-widest pl-1">Log_Entry</label>
                    <textarea
                        className="input-field min-h-[100px] group-focus-within:border-primary-500 transition-colors"
                        value={formData.note || ''}
                        onChange={e => setFormData({ ...formData, note: e.target.value })}
                        placeholder="ADDITIONAL_DATA..."
                    />
                </div>

                <div className="pt-6 flex justify-end gap-4 border-t border-slate-700/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cancel_Op
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Commit_Data'}
                    </button>
                </div>
            </form>
        </div>
    )
}
