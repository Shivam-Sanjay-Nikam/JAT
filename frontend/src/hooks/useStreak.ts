
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DailyCompletion } from '../types'

interface StreakData {
    currentStreak: number
    longestStreak: number
    completionHistory: DailyCompletion[]
}

export const useStreak = () => {
    const [streakData, setStreakData] = useState<StreakData>({
        currentStreak: 0,
        longestStreak: 0,
        completionHistory: []
    })
    const [loading, setLoading] = useState(true)

    const fetchCompletionHistory = async (days: number = 365) => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data, error } = await supabase
            .from('daily_completions')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0])
            .order('date', { ascending: false })

        if (error) {
            console.error('Error fetching completion history:', error)
            setLoading(false)
            return
        }

        const completionHistory = data || []

        // Calculate current streak (consecutive days with 100% completion from today backwards)
        let currentStreak = 0
        const today = new Date().toISOString().split('T')[0]
        let checkDate = new Date()

        for (let i = 0; i < days; i++) {
            const dateStr = checkDate.toISOString().split('T')[0]
            const completion = completionHistory.find(c => c.date === dateStr)

            if (completion && completion.completion_percentage === 100) {
                currentStreak++
            } else {
                // Only break if we're past today (allow for today to not be complete yet)
                if (dateStr < today) {
                    break
                }
            }

            checkDate.setDate(checkDate.getDate() - 1)
        }

        // Calculate longest streak (max consecutive days with 100% completion)
        let longestStreak = 0
        let tempStreak = 0

        // Sort by date ascending for streak calculation
        const sortedHistory = [...completionHistory].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        for (let i = 0; i < sortedHistory.length; i++) {
            if (sortedHistory[i].completion_percentage === 100) {
                tempStreak++
                longestStreak = Math.max(longestStreak, tempStreak)
            } else {
                tempStreak = 0
            }
        }

        setStreakData({
            currentStreak,
            longestStreak,
            completionHistory
        })
        setLoading(false)
    }

    useEffect(() => {
        fetchCompletionHistory()

        // Subscribe to real-time changes in daily_completions
        const setupSubscription = async () => {
            const { data: { user: userData } } = await supabase.auth.getUser()

            if (!userData) return

            const subscription = supabase
                .channel('daily-completions-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'daily_completions',
                    filter: `user_id=eq.${userData.id}`
                }, () => {
                    // Refresh streak data when completions change
                    fetchCompletionHistory()
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        }

        setupSubscription()

        // Listen for manual refresh events from todo updates
        const handleRefresh = () => {
            fetchCompletionHistory()
        }
        window.addEventListener('refresh-calendar', handleRefresh)

        return () => {
            window.removeEventListener('refresh-calendar', handleRefresh)
        }
    }, [])

    return {
        ...streakData,
        loading,
        refresh: fetchCompletionHistory
    }
}
