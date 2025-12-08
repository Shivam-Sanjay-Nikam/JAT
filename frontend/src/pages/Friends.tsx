
import React, { useState, useEffect } from 'react'
import { Navbar } from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { FriendRequestCard } from '../components/FriendRequestCard'
import { UserPlus, Users as UsersIcon, User, Trash2 } from 'lucide-react'
import { useFriendRequests } from '../hooks/useFriendRequests'
import { useFriends } from '../hooks/useFriends'
import { useAuth } from '../hooks/useAuth'
import { ConfirmDialog } from '../components/ConfirmDialog'

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

    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; friendshipId: string; userId: string; friendId: string } | null>(null)

    const handleRemoveFriend = async () => {
        if (!deleteConfirm) return

        const { friendshipId, userId, friendId } = deleteConfirm

        // Delete both directions of friendship
        const { error: error1 } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', userId)
            .eq('friend_id', friendId)

        const { error: error2 } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', friendId)
            .eq('friend_id', userId)

        if (error1 || error2) {
            console.error('Error removing friend:', error1 || error2)
        } else {
            refreshFriends()
        }

        setDeleteConfirm(null)
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header */}
                <div className="border-b border-slate-800 pb-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-[Orbitron] uppercase tracking-[0.2em] mb-1">
                        Network_Nodes
                    </h1>
                    <p className="text-primary-400 font-mono text-[10px] tracking-wider">
                        &gt; ESTABLISHED_CONNECTIONS: {friends.length} // PENDING_REQUESTS: {requests.length}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Add Friend & List */}
                    <div className="flex-1 space-y-8">

                        {/* Add Friend Input */}
                        <div className="bg-slate-900/40 p-1 border border-primary-500/20 max-w-xl">
                            <form onSubmit={sendRequest} className="flex gap-1">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-primary-500 font-mono text-sm">&gt;</span>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="INPUT_OPERATOR_EMAIL"
                                        className="w-full bg-slate-950 border-none text-slate-200 text-xs font-mono py-2.5 pl-8 focus:ring-0 placeholder:text-slate-600 tracking-wide"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]">
                                    {loading ? 'Transmitting...' : 'Ping_Node'}
                                </button>
                            </form>
                            {message && <p className="mt-1.5 ml-1 text-[10px] font-mono text-primary-400/80">&gt;&gt; {message}</p>}
                        </div>

                        {/* Friends Grid */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <UsersIcon className="w-4 h-4 text-primary-500" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-widest font-[Orbitron]">Active_Nodes</h2>
                                <div className="h-px bg-slate-800 flex-1 ml-4"></div>
                            </div>

                            {friendsLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-24 bg-slate-900/50 border border-slate-800/50 animate-pulse relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : friends.length === 0 ? (
                                <div className="p-8 border border-slate-800 border-dashed text-center">
                                    <p className="text-slate-500 font-mono text-xs mb-1">NO_NODES_FOUND</p>
                                    <p className="text-slate-600 text-[10px]">INITIATE CONNECTION PROTOCOL ABOVE</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {friends.map((friend) => {
                                        const friendUserId = friend.user_id === user?.id ? friend.friend_id : friend.user_id
                                        return (
                                            <div
                                                key={friend.id}
                                                className="group bg-slate-900/50 hover:bg-slate-900/80 border border-slate-700/50 hover:border-primary-500/30 transition-all p-4 relative overflow-hidden"
                                            >
                                                {/* Card scanline */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                                <div className="flex justify-between items-start relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-800 border border-slate-700 flex items-center justify-center text-primary-500 overflow-hidden relative">
                                                            <User className="w-4 h-4" />
                                                            {/* Generic avatar decorative corners */}
                                                            <div className="absolute top-0 left-0 w-1 h-1 bg-primary-500/50"></div>
                                                            <div className="absolute bottom-0 right-0 w-1 h-1 bg-primary-500/50"></div>
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[150px]" title={friend.friend_email}>
                                                                {friend.friend_email?.split('@')[0] || `NODE_${friendUserId?.slice(0, 4)}`}
                                                            </p>
                                                            <p className="text-[9px] font-mono text-slate-500 flex items-center gap-1.5">
                                                                <span className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                                                                ONLINE
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setDeleteConfirm({
                                                            show: true,
                                                            friendshipId: friend.id,
                                                            userId: friend.user_id,
                                                            friendId: friend.friend_id
                                                        })}
                                                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                                                        title="Disconnect Node"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                                                    <span className="text-[9px] text-slate-600 font-mono">LINK_EST: {new Date(friend.created_at).toLocaleDateString()}</span>
                                                    <div className="text-[9px] text-primary-500/50 font-mono tracking-widest">SECURE</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Requests Section */}
                    {requests.length > 0 && (
                        <div className="w-full lg:w-80 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <h2 className="text-sm font-bold text-white uppercase tracking-widest font-[Orbitron]">Incoming_Signals</h2>
                            </div>
                            <div className="space-y-3">
                                {requests.map(req => (
                                    <FriendRequestCard
                                        key={req.id}
                                        request={req}
                                        onUpdate={fetchRequests}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={deleteConfirm?.show || false}
                    title="Disconnect_Node"
                    message="Are you sure you want to disconnect this network node? This action will remove the connection from both sides."
                    confirmText="Disconnect"
                    cancelText="Cancel"
                    onConfirm={handleRemoveFriend}
                    onCancel={() => setDeleteConfirm(null)}
                />
            </main>
        </div>
    )
}
