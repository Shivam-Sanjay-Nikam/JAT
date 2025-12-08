
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

                // Insert into friends table: (me, sender)
                const { error: friendError } = await supabase
                    .from('friends')
                    .insert({ user_id: user.id, friend_id: request.sender_id })

                if (friendError) throw friendError

                // Also insert reverse friendship (bidirectional)
                const { error: reverseError } = await supabase
                    .from('friends')
                    .insert({ user_id: request.sender_id, friend_id: user.id })

                // Ignore duplicate key errors (23505) - friendship might already exist
                if (reverseError && reverseError.code !== '23505') {
                    console.warn('Reverse friendship insert failed:', reverseError)
                }

                // Insert reverse friendship if needed by schema (we used UNIQUE(user_id, friend_id), so maybe bidirectional logic is needed or just one row implies both?)
                // Our 'friends' schema (user_id, friend_id) usually implies direction unless query handles OR.
                // Let's just insert one row and ensure query looks for both sides.
            }

            const { error } = await supabase
                .from('friend_requests')
                .update({ status })
                .eq('id', request.id)

            if (error) throw error
            onUpdate()
        } catch (err) {
            console.error('Error updating request:', err)
        }
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex justify-between items-center text-slate-200">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-full">
                    <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                    <p className="font-medium">Request from</p>
                    {/* In real app, we'd fetch sender details (name/email) via another query or view */}
                    <p className="text-sm text-slate-400 text-xs">User ID: ...{request.sender_id.slice(-5)}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => handleAction('ACCEPTED')}
                    className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-md transition-colors"
                    title="Accept"
                >
                    <Check className="w-5 h-5" />
                </button>
                <button
                    onClick={() => handleAction('REJECTED')}
                    className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                    title="Reject"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
