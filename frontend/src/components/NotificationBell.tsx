
import React, { useState } from 'react'
import { Bell, ExternalLink, X } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()

    const handleNotificationClick = (notification: any, e?: React.MouseEvent) => {
        // Don't navigate if clicking the delete button
        if ((e?.target as HTMLElement)?.closest('.delete-btn')) {
            return
        }

        if (!notification.is_read) {
            markAsRead(notification.id)
        }
        if (notification.link) {
            if (notification.link.startsWith('http')) {
                window.open(notification.link, '_blank')
            } else {
                navigate(notification.link)
            }
            setIsOpen(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        await deleteNotification(notificationId)
    }

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
                                        onClick={(e) => handleNotificationClick(notification, e)}
                                        className={`px-4 py-3 hover:bg-slate-800/50 cursor-pointer transition-colors group relative ${!notification.is_read ? 'bg-slate-800/20' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 pr-8">
                                                <p className="text-sm text-slate-300">{notification.message}</p>
                                                <span className="text-xs text-slate-500 mt-1 block">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {notification.link && (
                                                    <ExternalLink className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(e, notification.id)}
                                                    className="delete-btn p-1 rounded hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete notification"
                                                >
                                                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                                                </button>
                                            </div>
                                        </div>
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
