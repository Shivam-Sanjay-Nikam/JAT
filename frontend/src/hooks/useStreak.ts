
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DailyCompletion } from '../types'

interface StreakData {
    currentStreak: number
    longestStreak: number
    completionHistory: DailyCompletion[]
}

export const useStreak = () => {
    const [currentStreak, setCurrentStreak] = useState(0)
    const [longestStreak, setLongestStreak] = useState(0)
    const [completionHistory, setCompletionHistory] = useState<DailyCompletion[]>([])
    const [productivityHistory, setProductivityHistory] = useState<{ completion_date: string, task_count: number }[]>([])
    const [consistencyHistory, setConsistencyHistory] = useState<{ stat_date: string, total_due: number, completed_on_time: number }[]>([])
    const [loading, setLoading] = useState(true)

    // This function calculates streaks based on a given history and updates state
    const calculateStreak = (history: DailyCompletion[]) => {
        let current = 0
        let longest = 0
        let tempSequence = 0

        // Calculate streaks based on history
        // Sort history by date descending for current streak
        const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        // Current Streak
        // Check if today or yesterday is 100% complete
        if (sortedHistory.length > 0) {
            const latestCompletion = sortedHistory[0];
            if (latestCompletion.completion_percentage === 100 && latestCompletion.date === today) {
                current++;
            } else if (latestCompletion.completion_percentage === 100 && latestCompletion.date === yesterday) {
                // If yesterday was 100% and today isn't in history yet, or isn't 100%, current streak starts from yesterday
                current++;
            }
        }

        // Continue checking backwards from the latest relevant day
        for (let i = 0; i < sortedHistory.length; i++) {
            const day = sortedHistory[i];
            const prevDay = sortedHistory[i - 1];

            if (day.completion_percentage === 100) {
                if (i === 0) {
                    // Already handled the first day (today/yesterday)
                } else {
                    const dayDate = new Date(day.date);
                    const prevDayDate = new Date(prevDay.date);
                    const diffTime = Math.abs(prevDayDate.getTime() - dayDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1 && prevDay.completion_percentage === 100) {
                        current++;
                    } else {
                        // Break if the sequence is broken or not 100%
                        break;
                    }
                }
            } else {
                // If the current day is not 100%, the current streak is broken
                break;
            }
        }

        // Longest Streak
        // Sort ascending for easier sequential calculation
        const ascendingHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        ascendingHistory.forEach((day) => {
            if (day.completion_percentage === 100) {
                tempSequence++
            } else {
                longest = Math.max(longest, tempSequence)
                tempSequence = 0
            }
        })
        longest = Math.max(longest, tempSequence) // Account for a streak ending at the end of the history

        setCurrentStreak(current)
        setLongestStreak(longest)
    }

    const fetchStreakData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                return
            }

            // Fetch daily completions for streak and history
            const { data: history, error: historyError } = await supabase
                .from('daily_completions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: true })

            // Fetch productivity stats (completions per day)
            const today = new Date()
            const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
            const endOfYear = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0]

            const { data: productivity, error: productivityError } = await supabase
                .rpc('get_productivity_stats', {
                    start_date: startOfYear,
                    end_date: endOfYear
                })

            // Fetch consistency stats (on-time completion)
            const { data: consistency, error: consistencyError } = await supabase
                .rpc('get_consistency_stats', {
                    start_date: startOfYear,
                    end_date: endOfYear
                })

            if (historyError) throw historyError
            if (productivityError) console.warn('Productivity stats fetch failed:', productivityError)
            if (consistencyError) console.warn('Consistency stats fetch failed:', consistencyError)

            if (history) {
                setCompletionHistory(history as DailyCompletion[])
                calculateStreak(history as DailyCompletion[])
            }

            if (productivity) {
                setProductivityHistory(productivity)
            }

            if (consistency) {
                setConsistencyHistory(consistency)
            }
        } catch (error) {
            console.error('Error fetching streak data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStreakData()

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
                    fetchStreakData()
                })
                .subscribe()

            return subscription
        }

        let subscription: any

        setupSubscription().then(sub => {
            subscription = sub
        })

        // Listen for manual refresh events from todo updates
        const handleRefresh = () => {
            fetchStreakData()
        }
        window.addEventListener('refresh-calendar', handleRefresh)

        return () => {
            window.removeEventListener('refresh-calendar', handleRefresh)
            if (subscription) subscription.unsubscribe()
        }
    }, [])

    return {
        currentStreak,
        longestStreak,
        completionHistory,
        productivityHistory,
        consistencyHistory,
        loading,
        refresh: fetchStreakData
    }
}
