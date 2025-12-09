
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Resource, ResourceType } from '../types'

export const useResources = () => {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL')

    // Fetch all resources for the current user
    const fetchResources = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        let query = supabase
            .from('resources')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        // Apply type filter if not 'ALL'
        if (filterType !== 'ALL') {
            query = query.eq('type', filterType)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching resources:', error)
        } else {
            setResources(data || [])
        }
        setLoading(false)
    }

    // Add a new resource
    const addResource = async (resource: Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('resources')
            .insert({
                user_id: user.id,
                title: resource.title,
                type: resource.type,
                content: resource.content,
                description: resource.description,
                tags: resource.tags || []
            })
            .select()
            .single()

        if (error) {
            console.error('Error adding resource:', error)
            throw error
        } else if (data) {
            setResources(prev => [data, ...prev])
        }
    }

    // Update an existing resource
    const updateResource = async (id: string, updates: Partial<Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
        const { data, error } = await supabase
            .from('resources')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating resource:', error)
            throw error
        } else if (data) {
            setResources(prev => prev.map(r => r.id === id ? data : r))
        }
    }

    // Delete a resource
    const deleteResource = async (id: string) => {
        const resource = resources.find(r => r.id === id)

        // If it's a PDF, delete the file from storage
        if (resource && resource.type === 'PDF') {
            const filePath = resource.content
            const { error: storageError } = await supabase.storage
                .from('resources')
                .remove([filePath])

            if (storageError) {
                console.error('Error deleting file from storage:', storageError)
            }
        }

        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting resource:', error)
            throw error
        } else {
            setResources(prev => prev.filter(r => r.id !== id))
        }
    }

    // Upload a PDF file to Supabase Storage
    const uploadPDF = async (file: File): Promise<string> => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Generate unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
            .from('resources')
            .upload(fileName, file)

        if (error) {
            console.error('Error uploading file:', error)
            throw error
        }

        return data.path
    }

    // Get public URL for a PDF
    const getPDFUrl = (filePath: string): string => {
        const { data } = supabase.storage
            .from('resources')
            .getPublicUrl(filePath)

        return data.publicUrl
    }

    useEffect(() => {
        fetchResources()

        // Subscribe to real-time changes
        const setupSubscription = async () => {
            const { data: { user: userData } } = await supabase.auth.getUser()
            if (!userData) return

            const subscription = supabase
                .channel('resources-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'resources',
                    filter: `user_id=eq.${userData.id}`
                }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newResource = payload.new as Resource
                        setResources(prev => [newResource, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedResource = payload.new as Resource
                        setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r))
                    } else if (payload.eventType === 'DELETE') {
                        setResources(prev => prev.filter(r => r.id !== payload.old.id))
                    }
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        }

        setupSubscription()
    }, [filterType])

    // Get counts by type
    const counts = {
        all: resources.length,
        pdf: resources.filter(r => r.type === 'PDF').length,
        link: resources.filter(r => r.type === 'LINK').length,
        note: resources.filter(r => r.type === 'NOTE').length
    }

    return {
        resources,
        loading,
        filterType,
        setFilterType,
        addResource,
        updateResource,
        deleteResource,
        uploadPDF,
        getPDFUrl,
        refresh: fetchResources,
        counts
    }
}
