
import React from 'react'
import { FriendRequest } from '../types'
import { Check, X, User } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface FriendRequestCardProps {
    request: FriendRequest
    onUpdate: () => void
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = ({ request, onUpdate }) => {
    const handleAction = async (status: 'ACCEPTED' | 'REJECTED') => {
        // Note: Accepting a friend request usually requires inserting into 'friends' table.
        // We can do this via Edge Function for transactional integrity or client-side transaction if possible.
        // For simplicity, we'll update status here, but trigger backend logic via DB trigger or Edge Function is better.
        // Let's assume we have a Postgres trigger handling logical insertion into 'friends' on update to 'ACCEPTED'
        // OR we just perform two operations here carefully.

        try {
            if (status === 'ACCEPTED') {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('User not authenticated')

                // Get the full request data including sender_email
                const { data: requestData } = await supabase
                    .from('friend_requests')
                    .select('sender_id, sender_email, receiver_email')
                    .eq('id', request.id)
                    .single()

                if (!requestData) throw new Error('Request not found')

                // The sender_email is the friend's email (person who sent us the request)
                const friendEmail = requestData.sender_email || ''

                // Insert friendship: user (me) -> friend (them)
                const { error: friendError } = await supabase
                    .from('friends')
                    .insert({
                        user_id: user.id,
                        friend_id: requestData.sender_id,
                        friend_email: friendEmail // Store their email
                    })

                if (friendError) throw friendError

                // Insert reverse friendship: friend (them) -> user (me)
                const { error: reverseError } = await supabase
                    .from('friends')
                    .insert({
                        user_id: requestData.sender_id,
                        friend_id: user.id,
                        friend_email: user.email || '' // Store our email for them
                    })

                // Ignore duplicate key errors (23505) - friendship might already exist
                if (reverseError && reverseError.code !== '23505') {
                    console.warn('Reverse friendship insert failed:', reverseError)
                }
            }
            // Our 'friends' schema (user_id, friend_id) usually implies direction unless query handles OR.
            // Let's just insert one row and ensure query looks for both sides.

            const { error } = await supabase
                .from('friend_requests')
                .update({ status })
                .eq('id', request.id)

            if (error) throw error

            // Refresh friend requests
            onUpdate()

            // Trigger a custom event to refresh friends list
            window.dispatchEvent(new Event('friends-updated'))
        } catch (err) {
            console.error('Error updating request:', err)
        }
    }

    return (
        <div className="bg-slate-900/80 border border-slate-700/50 p-4 relative group hover:border-primary-500/50 transition-all duration-300">
            {/* Tech Decoration */}
            <div className="absolute top-0 left-0 w-0.5 h-3 bg-primary-500/50 group-hover:bg-primary-500 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-3 h-0.5 bg-primary-500/50 group-hover:bg-primary-500 transition-colors"></div>

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary-500/10 border border-primary-500/20 rounded-sm">
                        <User className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                        <p className="font-bold text-xs uppercase tracking-wider text-primary-400 mb-0.5">Incoming_Signal</p>
                        <p className="text-[10px] font-mono text-slate-400">ID: {request.sender_id.slice(0, 8)}...</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => handleAction('ACCEPTED')}
                    className="flex-1 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/50 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                    <Check className="w-3 h-3" />
                    Accept
                </button>
                <button
                    onClick={() => handleAction('REJECTED')}
                    className="flex-1 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                    <X className="w-3 h-3" />
                    Reject
                </button>
            </div>
        </div>
    )
}
