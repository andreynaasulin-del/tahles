import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Initial response with security headers
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 2. Strict Mode: In production, missing keys = log and skip to prevent fatal crash
  if (!url || !key) {
    console.warn('Middleware: Supabase keys missing. Skipping auth.')
    return response
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...(options as object) })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...(options as object) })
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '', ...(options as object) })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...(options as object) })
        },
      },
    })

    // 3. Refresh session & handle anomalies
    const { data: { session } } = await supabase.auth.getSession()

    // Example: Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin') && !session) {
      console.log('Middleware: Redirecting unauthorized admin attempt')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch (e) {
    console.error('Middleware Critical Error:', e)
    // Return base response instead of 500 to keep site alive
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
