
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

        // Query friends where user_id = me (only get our friendship records, not reverse ones)
        const { data, error } = await supabase
            .from('friends')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching friends:', error)
        } else {
            // For each friend, use the stored friend_email
            const friendsWithEmails = (data || []).map((friend) => {
                // Use the friend_email that's already stored in the database
                const friendEmail = (friend as any).friend_email || `Friend ${friend.friend_id.slice(0, 8)}...`

                return {
                    ...friend,
                    friend_user_id: friend.friend_id,
                    friend_email: friendEmail
                }
            })

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

    return { friends, loading, refresh: fetchFriends, setFriends }
}

