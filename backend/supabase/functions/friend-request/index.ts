
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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { email } = await req.json()
        if (!email) throw new Error('Email is required')

        // Get current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // Check if request already exists
        const { data: existing } = await supabaseClient
            .from('friend_requests')
            .select('*')
            .eq('sender_id', user.id)
            .eq('receiver_email', email)
            .single()

        if (existing) {
            return new Response(
                JSON.stringify({ message: 'Request already sent' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Insert request with sender_email
        const { error: insertError } = await supabaseClient
            .from('friend_requests')
            .insert({ 
                sender_id: user.id, 
                receiver_email: email, 
                sender_email: user.email || '', // Store sender's email
                status: 'PENDING' 
            })

        if (insertError) throw insertError

        return new Response(
            JSON.stringify({ message: 'Friend request sent' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
