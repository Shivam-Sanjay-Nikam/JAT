import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { encrypted } = await req.json()
    if (!encrypted || typeof encrypted !== "string") {
      throw new Error("Encrypted payload is required")
    }

    // Encrypted format: ivBase64:cipherBase64
    const [ivBase64, cipherBase64] = encrypted.split(":")
    if (!ivBase64 || !cipherBase64) {
      throw new Error("Invalid encrypted payload format")
    }

    const keyString = Deno.env.get("ENCRYPTION_KEY") || "default-secret-key"
    const enc = new TextEncoder()

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(keyString.padEnd(32, "0").slice(0, 32)), // ensure 32 bytes
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    )

    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0))
    const cipherBytes = Uint8Array.from(atob(cipherBase64), (c) => c.charCodeAt(0))

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      keyMaterial,
      cipherBytes,
    )

    const password = new TextDecoder().decode(decrypted)

    return new Response(
      JSON.stringify({ password }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})

