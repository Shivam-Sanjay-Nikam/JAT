
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { GamificationStats } from '../types'

interface GamificationContextType {
    level: number
    currentExp: number
    totalExp: number
    nextLevelExp: number
    loading: boolean
    refreshStats: () => Promise<void>
    completeTaskWithRating: (todoId: string, rating: number) => Promise<any>
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<GamificationStats | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (!error && data) {
            setStats(data)
        } else if (error && error.code === 'PGRST116') {
            // Stats not found, maybe trigger didn't fire? Try to create?
            // For now, just leave null or handle initialization elsewhere
            console.log("No gamification stats found for user.")
        }
        setLoading(false)
    }

    const completeTaskWithRating = async (todoId: string, rating: number) => {
        const { data, error } = await supabase.rpc('complete_todo_with_rating', {
            todo_id: todoId,
            rating_val: rating
        })

        if (error) {
            console.error('Error completing task:', error)
            throw error
        }

        await fetchStats() // Refresh local stats
        return data
    }

    useEffect(() => {
        fetchStats()

        // Listen for realtime updates
        const subscription = supabase
            .channel('gamification_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_gamification'
            }, (payload) => {
                if (payload.new) {
                    setStats(payload.new as GamificationStats)
                }
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const level = stats?.level || 1
    const currentExp = stats?.current_exp || 0
    const totalExp = stats?.total_exp || 0
    const nextLevelExp = level * 100

    return (
        <GamificationContext.Provider value={{
            level,
            currentExp,
            totalExp,
            nextLevelExp,
            loading,
            refreshStats: fetchStats,
            completeTaskWithRating
        }}>
            {children}
        </GamificationContext.Provider>
    )
}

export const useGamification = () => {
    const context = useContext(GamificationContext)
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider')
    }
    return context
}
