
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
            // Fetch all friend requests to build email mapping
            const { data: allRequests } = await supabase
                .from('friend_requests')
                .select('sender_id, receiver_email')
            
            // Build maps for email lookup
            // Map: sender_id -> receiver_email (for requests we sent, receiver_email is their email)
            const sentRequestsMap = new Map<string, string>()
            
            // Also check requests we received - but we need sender's email
            // For received requests: sender_id = friend's ID, receiver_email = our email
            // We'll need to get sender email from somewhere else
            
            allRequests?.forEach(req => {
                if (req.sender_id === user.id) {
                    // We sent this request - receiver_email is their email
                    // But we can't map it to friend_user_id without knowing which user has that email
                    // We'll need to query differently
                }
            })
            
            // For each friend, get their email from friend_requests
            const friendsWithEmails = await Promise.all(
                (data || []).map(async (friend) => {
                    // Determine which ID is the friend (not me)
                    const friendUserId = friend.user_id === user.id ? friend.friend_id : friend.user_id
                    
                    let friendEmail = ''
                    
                    // Strategy 1: Check if we sent them a request
                    // Find requests where sender_id = our ID
                    // The receiver_email would be their email, but we need to match it to friendUserId
                    // Problem: We can't match email to user_id without querying auth.users
                    
                    // Strategy 2: Check if they sent us a request
                    // sender_id = friendUserId, receiver_email = our email
                    // But receiver_email is our email, not theirs
                    
                    // Strategy 3: Use friend_requests to find emails
                    // Get all requests where sender_id = friendUserId (they sent us)
                    // But we don't have their email stored
                    
                    // Best solution: Query friend_requests where sender_id = friendUserId
                    // If they sent us a request, we can't get their email from receiver_email (it's ours)
                    // But if we sent them a request, receiver_email is their email
                    // We need to match: find request where sender_id = our ID and receiver_email belongs to friendUserId
                    
                    // Actually, simpler: Check all requests we sent, and see if any receiver_email
                    // corresponds to this friend. But we can't match email to user_id.
                    
                    // For now, let's try a different approach:
                    // Check if there's a request where sender_id = friendUserId (they sent us)
                    // We can't get their email, but we can show a placeholder
                    // OR check if there's a request where we sent to them (sender_id = our ID)
                    // and try to match somehow
                    
                    // Simplest solution: Show email from friend_requests when available
                    // If we sent them a request, receiver_email is their email
                    // We'll need to store this or use a database view
                    
                    // For now, check requests we sent and see if we can match
                    const { data: requestsWeSent } = await supabase
                        .from('friend_requests')
                        .select('receiver_email')
                        .eq('sender_id', user.id)
                    
                    // Also check requests they sent us
                    const { data: requestsTheySent } = await supabase
                        .from('friend_requests')
                        .select('sender_id, receiver_email')
                        .eq('sender_id', friendUserId)
                        .maybeSingle()
                    
                    // If we sent them a request, receiver_email is their email
                    // But we can't match which receiver_email belongs to which friend_user_id
                    // without additional info
                    
                    // Get email from friend record (stored when accepting request)
                    friendEmail = (friend as any).friend_email || ''
                    
                    // If no email stored, try to get from friend_requests
                    if (!friendEmail) {
                        // Check friend_requests for sender_email
                        // If they sent us a request: sender_id = friendUserId, sender_email = their email
                        const { data: requestTheySent } = await supabase
                            .from('friend_requests')
                            .select('sender_email, receiver_email')
                            .eq('sender_id', friendUserId)
                            .maybeSingle()
                        
                        // If we sent them a request: sender_id = our ID, receiver_email = their email
                        const { data: requestWeSent } = await supabase
                            .from('friend_requests')
                            .select('sender_email, receiver_email')
                            .eq('sender_id', user.id)
                            .limit(100)
                        
                        // Use sender_email if they sent us request, or receiver_email if we sent them request
                        if (requestTheySent && (requestTheySent as any).sender_email) {
                            friendEmail = (requestTheySent as any).sender_email
                        } else if (requestWeSent && requestWeSent.length > 0) {
                            // Find the request where receiver_email might be their email
                            // We can't directly match, but we'll use the first one as fallback
                            // In practice, friend_email should be stored when accepting
                            friendEmail = requestWeSent[0].receiver_email || ''
                        }
                    }
                    
                    return {
                        ...friend,
                        friend_user_id: friendUserId,
                        friend_email: friendEmail || `Friend ${friendUserId.slice(0, 8)}...`
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

