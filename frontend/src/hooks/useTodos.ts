
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Todo } from '../types'

export const useTodos = (
    externalDate?: Date,
    setExternalDate?: (date: Date) => void
) => {
    const [localDate, setLocalDate] = useState(new Date())
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(true)
    const [allTimeStats, setAllTimeStats] = useState({ total: 0, completed: 0 })

    // Use external date if provided, otherwise use local state
    const selectedDate = externalDate || localDate
    const setSelectedDate = setExternalDate || setLocalDate

    // Get date in YYYY-MM-DD format (local timezone)
    const getDateString = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Get today's date in YYYY-MM-DD format (local timezone)
    const getTodayDate = () => {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const fetchTodosForDate = async (date: Date) => {
        setLoading(true)
        const dateStr = getDateString(date)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', dateStr)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching todos:', error)
        } else {
            setTodos(data || [])
        }
        setLoading(false)
    }

    const fetchAllTimeStats = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { count: totalCount, error: totalError } = await supabase
            .from('todos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        const { count: completedCount, error: completedError } = await supabase
            .from('todos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_completed', true)

        if (!totalError && !completedError) {
            setAllTimeStats({
                total: totalCount || 0,
                completed: completedCount || 0
            })
        }
    }

    const addTodo = async (title: string, startDate?: Date, endDate?: Date) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (startDate && endDate) {
            // Batch create for date range
            const todosToInsert = []
            let currentDate = new Date(startDate)
            const end = new Date(endDate)

            // Loop until currentDate is after endDate
            while (currentDate <= end) {
                todosToInsert.push({
                    user_id: user.id,
                    title,
                    date: getDateString(currentDate),
                    is_completed: false
                })
                // Add 1 day
                currentDate.setDate(currentDate.getDate() + 1)
                // Reset to new Date to avoid reference issues if pushing same object (though pushing primitive strings is fine, safer to clone date obj logic)
                currentDate = new Date(currentDate)
            }

            const { data, error } = await supabase
                .from('todos')
                .insert(todosToInsert)
                .select()

            if (error) {
                console.error('Error adding multi-day todos:', error)
            } else if (data) {
                // If any of the new todos are for the currently selected date, add them to state
                const currentViewDateStr = getDateString(selectedDate)
                const relevantTodos = data.filter(t => t.date === currentViewDateStr)

                if (relevantTodos.length > 0) {
                    setTodos(prev => [...prev, ...relevantTodos])
                }

                await checkDailyCompletion(currentViewDateStr)
                await fetchAllTimeStats()
            }
        } else {
            // Single day add (original logic)
            const dateStr = getDateString(selectedDate)

            const { data, error } = await supabase
                .from('todos')
                .insert({
                    user_id: user.id,
                    title,
                    date: dateStr,
                    is_completed: false
                })
                .select()
                .single()

            if (error) {
                console.error('Error adding todo:', error)
            } else if (data) {
                setTodos(prev => [...prev, data])
                // Check completion status after adding
                await checkDailyCompletion(dateStr)
                await fetchAllTimeStats()
            }
        }
    }

    const toggleTodo = async (id: string) => {
        const todo = todos.find(t => t.id === id)
        if (!todo) return

        const newIsCompleted = !todo.is_completed
        // If marking complete, set completed_at to now (ISO string). If marking incomplete, set to null.
        const completedAt = newIsCompleted ? new Date().toISOString() : null

        const { data, error } = await supabase
            .from('todos')
            .update({
                is_completed: newIsCompleted,
                completed_at: completedAt
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error toggling todo:', error)
        } else if (data) {
            setTodos(prev => prev.map(t => t.id === id ? data : t))
            // Check completion status after toggling
            await checkDailyCompletion(getDateString(selectedDate))
            await fetchAllTimeStats()
        }
    }

    const deleteTodo = async (id: string) => {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting todo:', error)
        } else {
            setTodos(prev => prev.filter(t => t.id !== id))
            // Check completion status after deleting
            await checkDailyCompletion(getDateString(selectedDate))
            await fetchAllTimeStats()
        }
    }

    const checkDailyCompletion = async (dateStr: string) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Call Edge Function to check and update daily completion
        const { data, error } = await supabase.functions.invoke('check-daily-completion', {
            body: {
                user_id: user.id,
                date: dateStr
            }
        })

        if (error) {
            console.error('Error checking daily completion:', error)
        } else if (data) {
            console.log('Daily completion updated:', data)

            // Small delay to ensure database is updated before calendar refreshes
            await new Promise(resolve => setTimeout(resolve, 500))

            // Trigger a manual refresh of the calendar by emitting a custom event
            window.dispatchEvent(new CustomEvent('refresh-calendar'))
        }
    }

    // Navigate to previous day
    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() - 1)
        setSelectedDate(newDate)
    }

    // Navigate to next day
    const goToNextDay = () => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + 1)
        setSelectedDate(newDate)
    }

    // Go to today
    const goToToday = () => {
        setSelectedDate(new Date())
    }

    useEffect(() => {
        fetchTodosForDate(selectedDate)
        fetchAllTimeStats()

        // Subscribe to real-time changes
        const setupSubscription = async () => {
            const { data: { user: userData } } = await supabase.auth.getUser()

            if (!userData) return

            const dateStr = getDateString(selectedDate)
            const subscription = supabase
                .channel('todos-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'todos',
                    filter: `user_id=eq.${userData.id}`
                }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newTodo = payload.new as Todo
                        if (newTodo.date === dateStr) {
                            setTodos(prev => {
                                if (prev.some(t => t.id === newTodo.id)) return prev
                                return [...prev, newTodo]
                            })
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedTodo = payload.new as Todo
                        if (updatedTodo.date === dateStr) {
                            setTodos(prev => prev.map(t => t.id === updatedTodo.id ? updatedTodo : t))
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setTodos(prev => prev.filter(t => t.id !== payload.old.id))
                    }
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        }

        setupSubscription()
    }, [selectedDate]) // Re-fetch when selectedDate changes

    // Midnight refresh - check every minute if day has changed
    useEffect(() => {
        const checkMidnight = setInterval(() => {
            const today = getTodayDate()
            const selected = getDateString(selectedDate)

            // If we're viewing "today" but the actual date has changed, update to new today
            if (selected !== today && getDateString(new Date()) === today) {
                // Only auto-update if we were viewing today
                const wasViewingToday = selected === getTodayDate()
                if (wasViewingToday) {
                    setSelectedDate(new Date())
                }
            }
        }, 60000) // Check every minute

        return () => clearInterval(checkMidnight)
    }, [selectedDate])

    const completionPercentage = todos.length > 0
        ? Math.round((todos.filter(t => t.is_completed).length / todos.length) * 100)
        : 0

    const isToday = getDateString(selectedDate) === getTodayDate()

    return {
        todos,
        loading,
        addTodo,
        toggleTodo,
        deleteTodo,
        refresh: () => fetchTodosForDate(selectedDate),
        completionPercentage,
        completedCount: todos.filter(t => t.is_completed).length,
        totalCount: todos.length,
        selectedDate,
        isToday,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        allTimeStats
    }
}
