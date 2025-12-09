
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Todo } from '../types'

export const useTodos = () => {
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(true)

    // Get today's date in YYYY-MM-DD format (local timezone)
    const getTodayDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    }

    const fetchTodayTodos = async () => {
        setLoading(true)
        const todayDate = getTodayDate()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', todayDate)
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

        const todayDate = getTodayDate()

        const { data, error } = await supabase
            .from('todos')
            .insert({
                user_id: user.id,
                title,
                date: todayDate,
                is_completed: false
            })
            .select()
            .single()

        if (error) {
            console.error('Error adding todo:', error)
        } else if (data) {
            setTodos(prev => [...prev, data])
            // Check completion status after adding
            await checkDailyCompletion()
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
            await checkDailyCompletion()
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
            await checkDailyCompletion()
        }
    }

    const checkDailyCompletion = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const todayDate = getTodayDate()

        // Call Edge Function to check and update daily completion
        const { data, error } = await supabase.functions.invoke('check-daily-completion', {
            body: {
                user_id: user.id,
                date: todayDate
            }
        })

        if (error) {
            console.error('Error checking daily completion:', error)
        } else if (data) {
            console.log('Daily completion updated:', data)
        }
    }

    useEffect(() => {
        fetchTodayTodos()

        // Subscribe to real-time changes
        const setupSubscription = async () => {
            const { data: { user: userData } } = await supabase.auth.getUser()

            if (!userData) return

            const todayDate = getTodayDate()
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
                        if (newTodo.date === todayDate) {
                            setTodos(prev => [...prev, newTodo])
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedTodo = payload.new as Todo
                        if (updatedTodo.date === todayDate) {
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
    }, [])

    const completionPercentage = todos.length > 0
        ? Math.round((todos.filter(t => t.is_completed).length / todos.length) * 100)
        : 0

    return {
        todos,
        loading,
        addTodo,
        toggleTodo,
        deleteTodo,
        refresh: fetchTodayTodos,
        completionPercentage,
        completedCount: todos.filter(t => t.is_completed).length,
        totalCount: todos.length
    }
}
