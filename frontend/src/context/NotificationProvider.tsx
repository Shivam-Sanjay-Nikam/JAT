
import React, { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Notification } from '../types'

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => Promise<void>
    deleteNotification: (id: string) => Promise<void>
}

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: async () => { },
    deleteNotification: async () => { },
})

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        if (!user) {
            setNotifications([])
            return
        }

        // Initial fetch
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) {
                // Map notifications to include link from data field
                const mappedNotifications = data.map((n: any) => ({
                    ...n,
                    link: n.data?.link || n.link // Support both data.link and direct link field
                }))
                setNotifications(mappedNotifications as Notification[])
            }
        }

        fetchNotifications()

        // Realtime subscription
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newNotification = payload.new as any
                    // Map notification to include link from data field
                    const mappedNotification = {
                        ...newNotification,
                        link: newNotification.data?.link || newNotification.link
                    }
                    setNotifications((prev) => [mappedNotification as Notification, ...prev])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        }
    }

    const deleteNotification = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id))
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, deleteNotification }}>
            {children}
        </NotificationContext.Provider>
    )
}
