
import React, { useState, useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { FriendRequestCard } from '../components/FriendRequestCard'
import { FriendRequest } from '../types'
import { UserPlus, Users as UsersIcon } from 'lucide-react'
import { useFriendRequests } from '../hooks/useFriendRequests'

export const Friends: React.FC = () => {
    const [email, setEmail] = useState('')
    const [friendsCount, setFriendsCount] = useState(0) // Placeholder for actual friend list
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { pendingRequests: requests, refresh: fetchRequests } = useFriendRequests()

    const sendRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const { data, error } = await supabase.functions.invoke('friend-request', {
            body: { email }
        })

        if (error) setMessage('Failed to send request')
        else if (data.error) setMessage(data.error)
        else setMessage('Friend request sent!')

        setLoading(false)
        setEmail('')
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Add Friend Section */}
                    <div className="flex-1 space-y-6">
                        <div className="glass-panel p-6 rounded-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary-400" />
                                Add Friend
                            </h2>
                            <form onSubmit={sendRequest} className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter friend's email"
                                    className="input-field"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
                                    {loading ? 'Sending...' : 'Send Request'}
                                </button>
                            </form>
                            {message && <p className="mt-2 text-sm text-slate-400">{message}</p>}
                        </div>

                        {/* Friend List Placeholder */}
                        <div className="glass-panel p-6 rounded-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <UsersIcon className="w-5 h-5 text-primary-400" />
                                My Friends
                            </h2>
                            <p className="text-slate-500 italic">
                                Friends list implementation would query the 'friends' table.
                            </p>
                        </div>
                    </div>

                    {/* Requests Section */}
                    <div className="w-full md:w-1/3">
                        <h2 className="text-xl font-bold text-white mb-4">Pending Requests</h2>
                        <div className="space-y-3">
                            {requests.length === 0 ? (
                                <p className="text-slate-500">No pending requests</p>
                            ) : (
                                requests.map(req => (
                                    <FriendRequestCard
                                        key={req.id}
                                        request={req}
                                        onUpdate={fetchRequests}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
