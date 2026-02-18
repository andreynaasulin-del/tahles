// @ts-nocheck - Next.js conditional imports
// For Next.js 14 App Router — Server Components and Route Handlers
// Uses @supabase/ssr to forward cookies for session management
import { createServerClient as createSsrClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export function createServerClient() {
  const cookieStore = cookies()

  return createSsrClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
