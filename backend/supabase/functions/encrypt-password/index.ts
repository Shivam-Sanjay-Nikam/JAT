
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { password } = await req.json()
        if (!password) throw new Error('Password is required')

        // Simple XOR/Base64 "Encryption" for demo purposes. 
        // In production, use a proper key from Deno.env.get('ENCRYPTION_KEY') and AES-GCM.
        const key = Deno.env.get('ENCRYPTION_KEY') || 'default-secret-key'

        // Web Crypto API AES-GCM implementation
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(key.padEnd(32, '0').slice(0, 32)), // Ensure 32 bytes
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            keyMaterial,
            enc.encode(password)
        );

        const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
        const ivBase64 = btoa(String.fromCharCode(...iv));

        return new Response(
            JSON.stringify({ encrypted: `${ivBase64}:${encryptedBase64}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
