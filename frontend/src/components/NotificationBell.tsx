
import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

export const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-800 transition-colors"
            >
                <Bell className="w-6 h-6 text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
                        <div className="p-3 border-b border-slate-800">
                            <h3 className="font-semibold text-slate-200">Notifications</h3>
                        </div>
                        <div className="py-2">
                            {notifications.length === 0 ? (
                                <p className="text-center text-slate-500 py-4">No notifications</p>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                        className={`px-4 py-3 hover:bg-slate-800/50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-slate-800/20' : ''}`}
                                    >
                                        <p className="text-sm text-slate-300">{notification.message}</p>
                                        <span className="text-xs text-slate-500 mt-1 block">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
