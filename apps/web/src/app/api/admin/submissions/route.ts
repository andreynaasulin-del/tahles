import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@vm/db'

const ADMIN_SECRET = process.env.CRON_SECRET || ''

/**
 * GET /api/admin/submissions?status=pending&limit=50&offset=0
 *
 * List submissions with optional filters
 * Auth: Bearer CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const supabase = createServiceRoleClient()

    let query = supabase
      .from('submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[submissions] List error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      submissions: data || [],
      total: count ?? 0,
      limit,
      offset,
    })
  } catch (err) {
    console.error('[submissions] Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
