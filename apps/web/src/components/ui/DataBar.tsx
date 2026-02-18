'use client'

import { useEffect, useState, useRef } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface Stats {
  total: number
  online: number
  vip: number
  verified: number
  updatesPerHour: number
  searchesToday: number
  checksToday: number
  topCity: { name: string; count: number } | null
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    if (prevRef.current === value) return
    const start = prevRef.current
    const diff  = value - start
    const steps = 20
    let step = 0
    const interval = setInterval(() => {
      step++
      setDisplay(Math.round(start + (diff * step) / steps))
      if (step >= steps) { clearInterval(interval); prevRef.current = value }
    }, 30)
    return () => clearInterval(interval)
  }, [value])

  return <span className="tabular-nums">{display.toLocaleString()}</span>
}

function StatItem({ label, value, live, mobileHide }: { label: string; value: number; live?: boolean; mobileHide?: boolean }) {
  return (
    <div className={`flex items-center gap-1 px-3 border-r border-black/10 last:border-0 shrink-0 ${mobileHide ? 'hidden sm:flex' : 'flex'}`}>
      {live && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-data-pulse shrink-0" />}
      <span className="text-black/35 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap">{label}</span>
      <span className="text-black font-bold text-[12px]">
        <AnimatedNumber value={value} />
      </span>
    </div>
  )
}

export function DataBar() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats | null>(null)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) setStats(await res.json())
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchStats()
    const iv = setInterval(fetchStats, 10_000)
    return () => clearInterval(iv)
  }, [])

  if (!stats) {
    return (
      <div className="w-full border-b border-black/8 bg-white h-8 flex items-center px-3 gap-4">
        {[60, 50, 80].map((w, i) => (
          <div key={i} className="h-2.5 rounded bg-gray-100 animate-pulse" style={{ width: w }} />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full border-b border-black/8 bg-white overflow-x-auto scrollbar-none">
      <div className="flex items-center h-8 min-w-max">
        {/* Всегда видны на мобиле */}
        <StatItem label={t('db_active')}  value={stats.total}  live />
        <StatItem label={t('db_online')}  value={stats.online} live />
        {/* Скрыты на мобиле */}
        <StatItem label={t('db_updates_hr')}     value={stats.updatesPerHour} mobileHide />
        <StatItem label={t('db_searches_today')} value={stats.searchesToday}  mobileHide />
        <StatItem label={t('db_checks_today')}   value={stats.checksToday}    mobileHide />
        {stats.topCity && (
          <div className="flex items-center gap-1 px-3 shrink-0">
            <span className="text-black/35 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap">
              {t('db_top_city')}
            </span>
            <span className="text-tahles-600 font-bold text-[12px] whitespace-nowrap">
              {stats.topCity.name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
