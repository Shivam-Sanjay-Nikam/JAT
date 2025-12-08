
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { JobApplication, ApplicationStatus } from '../types'
import { useAuth } from './useAuth'

export const useJobs = () => {
    const { user } = useAuth()
    const [jobs, setJobs] = useState<JobApplication[]>([])
    const [loading, setLoading] = useState(false)

    const fetchJobs = async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('job_applications')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error(error)
        else setJobs(data as JobApplication[])
        setLoading(false)
    }

    useEffect(() => {
        fetchJobs()
    }, [user])

    const addJob = async (job: Partial<JobApplication>, resumeFile?: File, passwordRaw?: string) => {
        if (!user) return
        try {
            let resume_url = ''
            if (resumeFile) {
                const fileExt = resumeFile.name.split('.').pop()
                const fileName = `${user.id}/${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from('resumes')
                    .upload(fileName, resumeFile)

                if (uploadError) throw uploadError
                resume_url = fileName // Store path, can generate signed URL later
            }

            let password_used = ''
            if (passwordRaw) {
                const { data: encData, error: encError } = await supabase.functions.invoke('encrypt-password', {
                    body: { password: passwordRaw }
                })
                if (encError) throw encError
                password_used = encData.encrypted
            }

            const { data, error } = await supabase
                .from('job_applications')
                .insert({
                    ...job,
                    user_id: user.id,
                    resume_url,
                    password_used
                })
                .select()
                .single()

            if (error) throw error

            setJobs(prev => [data as JobApplication, ...prev])

            // Notify friends
            await supabase.functions.invoke('notify-friends', {
                body: {
                    user_id: user.id,
                    company: job.company,
                    role: job.role,
                    status: job.application_status,
                    job_id: data.id // Pass job ID for link
                }
            })

        } catch (error) {
            console.error('Error adding job:', error)
            throw error
        }
    }

    const updateJob = async (id: string, updates: Partial<JobApplication>) => {
        const { data, error } = await supabase
            .from('job_applications')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        setJobs(prev => prev.map(j => j.id === id ? data as JobApplication : j))

        // Notify on status change? Maybe overkill for every edit, but good for status.
        if (updates.application_status) {
            await supabase.functions.invoke('notify-friends', {
                body: {
                    user_id: user?.id,
                    company: data.company,
                    role: data.role,
                    status: data.application_status,
                    job_id: id // Pass job ID for link
                }
            })
        }
    }

    const deleteJob = async (id: string) => {
        const { error } = await supabase
            .from('job_applications')
            .delete()
            .eq('id', id)

        if (error) throw error
        setJobs(prev => prev.filter(j => j.id !== id))
    }

    return { jobs, loading, addJob, updateJob, deleteJob, refreshJobs: fetchJobs }
}
