
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Todo } from '../types'

export const useTodos = () => {
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())

    // Get date in YYYY-MM-DD format (local timezone)
    const getDateString = (date: Date) => {
        return date.toISOString().split('T')[0]
    }

    // Get today's date in YYYY-MM-DD format (local timezone)
    const getTodayDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
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

    const addTodo = async (title: string) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

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
        }
    }

    const toggleTodo = async (id: string) => {
        const todo = todos.find(t => t.id === id)
        if (!todo) return

        const { data, error } = await supabase
            .from('todos')
            .update({ is_completed: !todo.is_completed })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error toggling todo:', error)
        } else if (data) {
            setTodos(prev => prev.map(t => t.id === id ? data : t))
            // Check completion status after toggling
            await checkDailyCompletion(getDateString(selectedDate))
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
                            setTodos(prev => [...prev, newTodo])
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
        goToToday
    }
}
