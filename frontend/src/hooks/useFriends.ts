
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Friend {
    id: string
    user_id: string
    friend_id: string
    created_at: string
    friend_email?: string // We'll fetch this separately
}

export const useFriends = () => {
    const { user } = useAuth()
    const [friends, setFriends] = useState<Friend[]>([])
    const [loading, setLoading] = useState(false)

    const fetchFriends = async () => {
        if (!user) return
        setLoading(true)
        
        // Query friends where user_id = me OR friend_id = me
        const { data, error } = await supabase
            .from('friends')
            .select('*')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching friends:', error)
        } else {
            // For each friend, try to get email from friend_requests table
            const friendsWithEmails = await Promise.all(
                (data || []).map(async (friend) => {
                    // Determine which ID is the friend (not me)
                    const friendUserId = friend.user_id === user.id ? friend.friend_id : friend.user_id
                    
                    // Try to get email from friend_requests where we sent them a request
                    // If we sent them a request: sender_id = user.id, receiver_email = their email
                    const { data: sentRequests } = await supabase
                        .from('friend_requests')
                        .select('receiver_email')
                        .eq('sender_id', user.id)
                    
                    // Also check requests we received - but receiver_email is our email, not theirs
                    // So we can't get their email from received requests
                    
                    // For now, we'll use a placeholder
                    // In production, you'd want to store friend emails in friends table or use a database view
                    const friendEmail = `Friend ${friendUserId.slice(0, 8)}...`
                    
                    return {
                        ...friend,
                        friend_user_id: friendUserId,
                        friend_email: friendEmail
                    }
                })
            )
            setFriends(friendsWithEmails as Friend[])
        }
        setLoading(false)
    }

    useEffect(() => {
        if (user) {
            fetchFriends()
            
            // Set up real-time subscription
            const channel = supabase
                .channel('friends_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'friends',
                    },
                    () => {
                        fetchFriends()
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [user?.id])

    return { friends, loading, refresh: fetchFriends }
}

