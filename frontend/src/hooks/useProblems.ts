import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Resource } from '../types'

export interface Problem extends Resource {
    isCompleted: boolean
    needsRevision: boolean
}

export const useProblems = () => {
    const [problems, setProblems] = useState<Problem[]>([])
    const [loading, setLoading] = useState(true)

    // Transform resource to problem with completion status
    const transformToProblem = (resource: Resource): Problem => {
        const tags = resource.tags || []
        const isCompleted = tags.some(tag => tag.toLowerCase() === 'completed')
        const needsRevision = tags.some(tag => tag.toLowerCase() === 'revise')
        
        return {
            ...resource,
            isCompleted,
            needsRevision
        }
    }

    // Fetch all problems (resources with type NOTE that are DSA problems)
    const fetchProblems = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        // Fetch all NOTE type resources (we'll use these for problems)
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'NOTE')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching problems:', error)
        } else {
            const transformedProblems = (data || []).map(transformToProblem)
            setProblems(transformedProblems)
        }
        setLoading(false)
    }

    // Add a new problem
    const addProblem = async (problemData: {
        title: string
        description?: string
        content: string // Notes/solution
        tags?: string[]
    }) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Ensure DSA tag is present
        const tags = problemData.tags || []
        if (!tags.some(t => t.toLowerCase() === 'dsa')) {
            tags.push('DSA')
        }

        const { data, error } = await supabase
            .from('resources')
            .insert({
                user_id: user.id,
                title: problemData.title,
                type: 'NOTE',
                content: problemData.content,
                description: problemData.description,
                tags: tags
            })
            .select()
            .single()

        if (error) {
            console.error('Error adding problem:', error)
            throw error
        } else if (data) {
            setProblems(prev => [transformToProblem(data), ...prev])
        }
    }

    // Update an existing problem
    const updateProblem = async (id: string, updates: {
        title?: string
        description?: string
        content?: string
        tags?: string[]
    }) => {
        const { data, error } = await supabase
            .from('resources')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating problem:', error)
            throw error
        } else if (data) {
            setProblems(prev => prev.map(p => p.id === id ? transformToProblem(data) : p))
        }
    }

    // Toggle completion status
    const toggleCompletion = async (id: string) => {
        const problem = problems.find(p => p.id === id)
        if (!problem) return

        const tags = problem.tags || []
        const isCompleted = tags.some(tag => tag.toLowerCase() === 'completed')
        
        let newTags: string[]
        if (isCompleted) {
            // Remove completed tag
            newTags = tags.filter(tag => tag.toLowerCase() !== 'completed')
        } else {
            // Add completed tag
            newTags = [...tags, 'Completed']
        }

        await updateProblem(id, { tags: newTags })
    }

    // Toggle revise tag
    const toggleRevise = async (id: string) => {
        const problem = problems.find(p => p.id === id)
        if (!problem) return

        const tags = problem.tags || []
        const needsRevision = tags.some(tag => tag.toLowerCase() === 'revise')
        
        let newTags: string[]
        if (needsRevision) {
            // Remove revise tag
            newTags = tags.filter(tag => tag.toLowerCase() !== 'revise')
        } else {
            // Add revise tag
            newTags = [...tags, 'Revise']
        }

        await updateProblem(id, { tags: newTags })
    }

    // Delete a problem
    const deleteProblem = async (id: string) => {
        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting problem:', error)
            throw error
        } else {
            setProblems(prev => prev.filter(p => p.id !== id))
        }
    }

    useEffect(() => {
        fetchProblems()

        // Subscribe to real-time changes
        const setupSubscription = async () => {
            const { data: { user: userData } } = await supabase.auth.getUser()
            if (!userData) return

            const subscription = supabase
                .channel('problems-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'resources',
                    filter: `user_id=eq.${userData.id}`
                }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newResource = payload.new as Resource
                        if (newResource.type === 'NOTE') {
                            setProblems(prev => [transformToProblem(newResource), ...prev])
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedResource = payload.new as Resource
                        if (updatedResource.type === 'NOTE') {
                            setProblems(prev => prev.map(p => p.id === updatedResource.id ? transformToProblem(updatedResource) : p))
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setProblems(prev => prev.filter(p => p.id !== payload.old.id))
                    }
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        }

        setupSubscription()
    }, [])

    // Calculate stats
    const stats = {
        total: problems.length,
        completed: problems.filter(p => p.isCompleted).length,
        needsRevision: problems.filter(p => p.needsRevision).length,
        inProgress: problems.filter(p => !p.isCompleted).length
    }

    return {
        problems,
        loading,
        addProblem,
        updateProblem,
        deleteProblem,
        toggleCompletion,
        toggleRevise,
        refresh: fetchProblems,
        stats
    }
}

