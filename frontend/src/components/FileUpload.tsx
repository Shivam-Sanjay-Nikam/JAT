
import React, { useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'

interface FileUploadProps {
    onFileSelect: (file: File | null) => void
    selectedFile: File | null
    accept?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, accept }) => {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <div className="w-full">
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept={accept}
                onChange={(e) => {
                    if (e.target.files?.[0]) onFileSelect(e.target.files[0])
                }}
            />

            {!selectedFile ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-primary-500 hover:bg-slate-800/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all"
                >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-400">Click to upload resume (PDF)</p>
                </div>
            ) : (
                <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between border border-slate-700">
                    <div className="flex items-center gap-3">
                        <FileText className="text-primary-400" />
                        <span className="text-sm text-slate-200 truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            onFileSelect(null)
                            if (inputRef.current) inputRef.current.value = ''
                        }}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    )
}
