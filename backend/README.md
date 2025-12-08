# Job Application Tracker - Backend

This folder contains the Supabase configuration and Edge Functions.

## Setup Instructions

1. **Create a Supabase Project**
   - Go to [database.new](https://database.new) and create a new project.

2. **Apply Database Schema**
   - Go to the SQL Editor in your Supabase Dashboard.
   - Run the contents of `supabase/schema.sql`.
   - Run the contents of `supabase/policies.sql`.
   - Run the contents of `supabase/storage-policies.sql`.

3. **Deploy Edge Functions**
   - Install Supabase CLI: `brew install supabase/tap/supabase` (Mac)
   - Login: `supabase login`
   - Link Project: `supabase link --project-ref <your-project-ref>`
   - Deploy: `supabase functions deploy`

4. **Environment Variables**
   - Ensure you set `ENCRYPTION_KEY` in your Edge Function secrets for `encrypt-password`.
     - `supabase secrets set ENCRYPTION_KEY=your-secret-key`

## Directory Structure

- `supabase/schema.sql`: Database tables and types.
- `supabase/policies.sql`: RLS security policies.
- `supabase/functions/`: Deno-based serverless functions.
