import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client

  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  client = createClient(url, serviceKey)
  return client
}
