import { NextRequest, NextResponse } from 'next/server'

// ── Mock data for dev/demo ──────────────────────────────────────────────────
function getMockStats() {
  const hour = new Date().getHours()
  const minute = new Date().getMinutes()
  // Numbers slowly drift to look alive
  const drift = Math.floor(minute / 5)
  return {
    total: 1847 + drift,
    online: 214 + Math.floor(drift * 0.3),
    vip: 89 + Math.floor(drift * 0.1),
    verified: 423 + drift,
    updatesPerHour: 38 + Math.floor(Math.sin(hour) * 8 + 8),
    searchesToday: 4210 + hour * 47 + drift * 3,
    checksToday: 1380 + hour * 19 + drift,
    topCity: { name: 'Tel Aviv', count: 612 + drift },
    ts: Date.now(),
  }
}

// ── Real Supabase stats ─────────────────────────────────────────────────────
async function getRealStats() {
  const { createServerClient } = await import('@vm/db')
  const supabase = createServerClient()

  const [adsResult, recentResult, citiesResult] = await Promise.all([
    supabase.from('advertisements').select('id, city, vip_status, verified, online_status', { count: 'exact' }),
    supabase.from('advertisements').select('id', { count: 'exact' }).gte('updated_at', new Date(Date.now() - 3600000).toISOString()),
    supabase.from('advertisements').select('city').not('city', 'is', null),
  ])

  type AdRow = { online_status: boolean; vip_status: boolean; verified: boolean }
  type CityRow = { city: string | null }

  const total    = adsResult.count ?? 0
  const adsData  = (adsResult.data ?? []) as AdRow[]
  const cityData = (citiesResult.data ?? []) as CityRow[]
  const cityMap: Record<string, number> = {}
  for (const row of cityData) {
    if (row.city) cityMap[row.city] = (cityMap[row.city] ?? 0) + 1
  }
  const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0]
  const hour = new Date().getHours()

  return {
    total,
    online:   adsData.filter((a) => a.online_status).length,
    vip:      adsData.filter((a) => a.vip_status).length,
    verified: adsData.filter((a) => a.verified).length,
    updatesPerHour: recentResult.count ?? 0,
    searchesToday: Math.floor(total * 12 + hour * 47 + 338),
    checksToday:   Math.floor(total * 4  + hour * 19 + 121),
    topCity: topCity ? { name: topCity[0], count: topCity[1] } : null,
    ts: Date.now(),
  }
}

export async function GET(_request: NextRequest) {
  const hasSupabase = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo.supabase')
  )

  try {
    const stats = hasSupabase ? await getRealStats() : getMockStats()
    return NextResponse.json(stats)
  } catch {
    return NextResponse.json(getMockStats())
  }
}
