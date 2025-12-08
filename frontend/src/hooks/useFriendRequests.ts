
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { FriendRequest } from '../types'
import { useAuth } from './useAuth'

export const useFriendRequests = () => {
    const { user } = useAuth()
    const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
    const [loading, setLoading] = useState(false)

    const fetchPendingRequests = async () => {
        if (!user?.email) return
        setLoading(true)
        const { data, error } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('status', 'PENDING')
            .eq('receiver_email', user.email)

        if (error) {
            console.error('Error fetching friend requests:', error)
        } else {
            setPendingRequests(data as FriendRequest[] || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        if (user?.email) {
            fetchPendingRequests()
            
            // Set up real-time subscription
            const channel = supabase
                .channel('friend_requests_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'friend_requests',
                        filter: `receiver_email=eq.${user.email}`,
                    },
                    () => {
                        fetchPendingRequests()
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [user?.email])

    return { pendingRequests, pendingCount: pendingRequests.length, loading, refresh: fetchPendingRequests }
}

