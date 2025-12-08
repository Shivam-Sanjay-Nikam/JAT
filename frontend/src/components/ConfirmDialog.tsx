import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
    confirmText?: string
    cancelText?: string
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel w-full max-w-md border border-red-500/30 shadow-[0_0_50px_-10px_rgba(239,68,68,0.3)] animate-fade-in-up">

                {/* Header */}
                <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-red-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-sm">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <div className="text-[9px] text-red-500 uppercase tracking-[0.2em] mb-0.5">Warning_Protocol</div>
                            <h2 className="text-base font-bold text-white font-[Orbitron] tracking-widest uppercase">
                                {title}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-slate-700/50 flex gap-3 bg-slate-900/50">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-500 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 transition-all text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)]"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
