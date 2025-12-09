
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client with service role key for admin operations
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { user_id, date } = await req.json()
        if (!user_id || !date) throw new Error('user_id and date are required')

        // Get all todos for this user on this date
        const { data: todos, error: todosError } = await supabaseClient
            .from('todos')
            .select('*')
            .eq('user_id', user_id)
            .eq('date', date)

        if (todosError) throw todosError

        const totalTasks = todos?.length || 0
        const completedTasks = todos?.filter(t => t.is_completed).length || 0
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        // Upsert daily completion record
        const { error: upsertError } = await supabaseClient
            .from('daily_completions')
            .upsert({
                user_id,
                date,
                total_tasks: totalTasks,
                completed_tasks: completedTasks,
                completion_percentage: completionPercentage,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,date'
            })

        if (upsertError) throw upsertError

        // If 100% completion and has tasks, notify friends
        if (completionPercentage === 100 && totalTasks > 0) {
            // Get user's email for notification message
            const { data: userData } = await supabaseClient.auth.admin.getUserById(user_id)
            const userEmail = userData?.user?.email || 'A friend'

            // Get all friends of this user
            const { data: friends, error: friendsError } = await supabaseClient
                .from('friends')
                .select('user_id, friend_id')
                .or(`user_id.eq.${user_id},friend_id.eq.${user_id}`)

            if (!friendsError && friends && friends.length > 0) {
                // Extract friend IDs (exclude the current user)
                const friendIds = friends.map(f =>
                    f.user_id === user_id ? f.friend_id : f.user_id
                )

                // Check if notification already sent today to avoid duplicates
                const { data: existingNotifs } = await supabaseClient
                    .from('notifications')
                    .select('id')
                    .in('user_id', friendIds)
                    .eq('type', 'STREAK_COMPLETION')
                    .gte('created_at', `${date}T00:00:00`)
                    .lte('created_at', `${date}T23:59:59`)
                    .contains('data', { streak_user_id: user_id })

                // Only send if not already sent today
                if (!existingNotifs || existingNotifs.length === 0) {
                    // Create notifications for all friends
                    const notifications = friendIds.map(friendId => ({
                        user_id: friendId,
                        type: 'STREAK_COMPLETION',
                        message: `🔥 ${userEmail.split('@')[0]} completed all tasks today and maintained their streak!`,
                        data: {
                            streak_user_id: user_id,
                            date: date,
                            total_tasks: totalTasks
                        },
                        is_read: false
                    }))

                    const { error: notifError } = await supabaseClient
                        .from('notifications')
                        .insert(notifications)

                    if (notifError) console.error('Error creating notifications:', notifError)
                }
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                completion_percentage: completionPercentage,
                total_tasks: totalTasks,
                completed_tasks: completedTasks
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
