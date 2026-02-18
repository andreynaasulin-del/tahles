import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Browser/client-side singleton
let _browserClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createBrowserClient() {
  if (_browserClient) return _browserClient
  _browserClient = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return _browserClient
}

// Server-side / bot service role client (full access, bypasses RLS)
// IMPORTANT: Never expose SUPABASE_SERVICE_ROLE_KEY to the browser
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
