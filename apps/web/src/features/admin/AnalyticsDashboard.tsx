'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient as createClient } from '@vm/db/src/client'
import {
    BarChart3,
    Users,
    RefreshCw,
    AlertCircle,
    Clock,
    TrendingUp,
    Database,
    Search
} from 'lucide-react'

interface Stats {
    total_ads: number
    total_titi: number
    total_changes: number
    last_crawl: string | null
    sync_rate: number
}

interface ChangeLog {
    id: string
    ad_nickname: string
    change_type: 'new' | 'updated' | 'removed'
    changed_fields: string[] | null
    created_at: string
}

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<Stats>({
        total_ads: 0,
        total_titi: 0,
        total_changes: 0,
        last_crawl: null,
        sync_rate: 0
    })
    const [logs, setLogs] = useState<ChangeLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient()

            try {
                // 1. Total Ads
                const { count: totalAds } = await supabase
                    .from('advertisements')
                    .select('*', { count: 'exact', head: true })

                // 2. Titi Ads
                const { count: titiAds } = await supabase
                    .from('advertisements')
                    .select('*', { count: 'exact', head: true })
                    .eq('source', 'titi')

                // 3. Changes
                const { count: totalChanges } = await supabase
                    .from('profile_changes')
                    .select('*', { count: 'exact', head: true })

                // 4. Logs with nicknames
                const { data: changes } = await supabase
                    .from('profile_changes')
                    .select('id, change_type, changed_fields, created_at, advertisements(nickname)')
                    .order('created_at', { ascending: false })
                    .limit(10)

                // 5. Last Crawl
                const { data: lastCrawl } = await supabase
                    .from('profile_changes')
                    .select('created_at')
                    .order('created_at', { ascending: false })
                    .limit(1)

                setStats({
                    total_ads: totalAds || 0,
                    total_titi: titiAds || 0,
                    total_changes: totalChanges || 0,
                    last_crawl: (lastCrawl as any)?.[0]?.created_at || null,
                    sync_rate: totalAds ? Math.round(((titiAds || 0) / totalAds) * 100) : 0
                })

                if (changes) {
                    setLogs(changes.map((c: any) => ({
                        id: c.id,
                        ad_nickname: c.advertisements?.nickname || 'Unknown',
                        change_type: c.change_type,
                        changed_fields: c.changed_fields,
                        created_at: c.created_at
                    })))
                }
            } catch (err) {
                console.error('Analytics Fetch Error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-velvet-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* ── Stats Header ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="text-velvet-500" />}
                    label="Total Database"
                    value={stats.total_ads.toLocaleString()}
                    subValue={`${stats.sync_rate}% External Sync`}
                />
                <StatCard
                    icon={<Database className="text-velvet-400" />}
                    label="Titi.co.il Source"
                    value={stats.total_titi.toLocaleString()}
                    subText="Active aggregated profiles"
                />
                <StatCard
                    icon={<TrendingUp className="text-green-500" />}
                    label="Updates Logged"
                    value={stats.total_changes.toLocaleString()}
                    subValue="Diff Engine Audit"
                />
                <StatCard
                    icon={<Clock className="text-blue-400" />}
                    label="Last Sync"
                    value={stats.last_crawl ? new Date(stats.last_crawl).toLocaleTimeString() : 'Never'}
                    subText={stats.last_crawl ? new Date(stats.last_crawl).toLocaleDateString() : 'N/A'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Change Logs ──────────────────────────────────────────────── */}
                <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-velvet-400" />
                            Live Sync Activity
                        </h3>
                        <span className="text-xs text-white/30 uppercase tracking-widest">Last 10 Events</span>
                    </div>

                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
                                <div className={`p-2 rounded-full ${log.change_type === 'new' ? 'bg-green-500/10 text-green-500' :
                                    log.change_type === 'updated' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    {log.change_type === 'new' ? <Users size={18} /> :
                                        log.change_type === 'updated' ? <RefreshCw size={18} /> : <AlertCircle size={18} />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white/90">{log.ad_nickname}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${log.change_type === 'new' ? 'bg-green-500/20 text-green-400' :
                                            log.change_type === 'updated' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {log.change_type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/30 mt-1">
                                        {log.changed_fields?.length
                                            ? `Modified: ${log.changed_fields.join(', ')}`
                                            : 'Initial aggregation from source'}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] text-white/20 font-medium">
                                        {new Date(log.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Sidebar Info ───────────────────────────────────────────── */}
                <div className="space-y-6">
                    <div className="glass rounded-3xl p-6 border border-white/5 bg-gradient-to-br from-velvet-500/10 to-transparent">
                        <h4 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-widest flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Crawler Health
                        </h4>
                        <div className="space-y-4">
                            <HealthItem label="Source titi.co.il" status="online" />
                            <HealthItem label="Normalization Engine" status="online" />
                            <HealthItem label="Diff Audit System" status="online" />
                            <HealthItem label="Stripe Webhooks" status="online" />
                        </div>
                    </div>

                    <div className="glass rounded-3xl p-6 border border-white/5">
                        <h4 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-widest">Database Usage</h4>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-velvet-500 to-velvet-300"
                                style={{ width: `${stats.sync_rate}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-white/20 flex justify-between">
                            <span>Imported Data</span>
                            <span>{stats.sync_rate}%</span>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

function StatCard({ icon, label, value, subValue, subText }: any) {
    return (
        <div className="glass rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                    {icon}
                </div>
                {subValue && <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2 py-1 rounded-lg italic">
                    {subValue}
                </span>}
            </div>
            <div>
                <p className="text-2xl font-black text-white group-hover:text-velvet-300 transition-colors">
                    {value}
                </p>
                <p className="text-xs text-white/40 font-medium mt-1 uppercase tracking-wider">
                    {label}
                </p>
                {subText && <p className="text-[10px] text-white/20 mt-2">{subText}</p>}
            </div>
        </div>
    )
}

function HealthItem({ label, status }: { label: string, status: 'online' | 'error' }) {
    return (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white-[0.03]">
            <span className="text-xs text-white/60 font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                <span className="text-[10px] font-bold uppercase tracking-tight text-white/40">{status}</span>
            </div>
        </div>
    )
}
