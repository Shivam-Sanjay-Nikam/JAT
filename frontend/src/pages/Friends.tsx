
import React, { useState, useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { FriendRequestCard } from '../components/FriendRequestCard'
import { UserPlus, Users as UsersIcon, User, Trash2 } from 'lucide-react'
import { useFriendRequests } from '../hooks/useFriendRequests'
import { useFriends } from '../hooks/useFriends'
import { useAuth } from '../hooks/useAuth'

export const Friends: React.FC = () => {
    const { user } = useAuth()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { pendingRequests: requests, refresh: fetchRequests } = useFriendRequests()
    const { friends, loading: friendsLoading, refresh: refreshFriends } = useFriends()

    useEffect(() => {
        // Listen for friend updates
        const handleFriendsUpdate = () => {
            refreshFriends()
        }
        window.addEventListener('friends-updated', handleFriendsUpdate)
        return () => window.removeEventListener('friends-updated', handleFriendsUpdate)
    }, [refreshFriends])

    const sendRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const { data, error } = await supabase.functions.invoke('friend-request', {
            body: { email }
        })

        if (error) setMessage('Failed to send request')
        else if (data.error) setMessage(data.error)
        else {
            setMessage('Friend request sent!')
            fetchRequests() // Refresh pending requests
        }

        setLoading(false)
        setEmail('')
    }

    const handleRemoveFriend = async (friendId: string, friendUserId: string) => {
        if (!confirm('Are you sure you want to remove this friend?')) return
        
        // Delete both directions of friendship
        const { error: error1 } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', friendId)
            .eq('friend_id', friendUserId)
        
        const { error: error2 } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', friendUserId)
            .eq('friend_id', friendId)
        
        if (error1 || error2) {
            console.error('Error removing friend:', error1 || error2)
        } else {
            refreshFriends()
        }
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

                        {/* Friend List */}
                        <div className="glass-panel p-6 rounded-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <UsersIcon className="w-5 h-5 text-primary-400" />
                                My Friends ({friends.length})
                            </h2>
                            {friendsLoading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : friends.length === 0 ? (
                                <p className="text-slate-500 italic">
                                    No friends yet. Send a friend request to get started!
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {friends.map((friend) => {
                                        // Determine which ID is the friend (not the current user)
                                        const friendUserId = friend.user_id === user?.id ? friend.friend_id : friend.user_id
                                        return (
                                            <div
                                                key={friend.id}
                                                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex justify-between items-center"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-700 rounded-full">
                                                        <User className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-200">
                                                            {friend.friend_email || `Friend ${friendUserId?.slice(0, 8)}...`}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Friends since {new Date(friend.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFriend(friend.user_id, friend.friend_id)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    title="Remove Friend"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
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
