import AnalyticsDashboard from '@/features/admin/AnalyticsDashboard'
import { RefreshCw } from 'lucide-react'

export const metadata = {
    title: 'Admin Analytics | Tahles Crawler',
    description: 'Monitor crawler activity and database health',
}

export default function AdminAnalyticsPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 glass border-b border-white/5">
                <div className="flex items-center justify-between px-6 py-4 max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-velvet-500 to-velvet-400 flex items-center justify-center font-black text-xs">
                            AD
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-tight uppercase">Admin Center</h1>
                            <p className="text-[10px] text-white/30 font-medium">System Monitoring & Analytics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Live System</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main ───────────────────────────────────────────────────────── */}
            <main className="max-w-[1400px] mx-auto px-6 py-10">

                <div className="mb-10">
                    <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic">
                        Crawler Insights
                    </h2>
                    <p className="text-sm text-white/30 max-w-lg">
                        Monitor real-time profile aggregation from <span className="text-velvet-400 font-bold">titi.co.il</span> and track database updates through our Diff Engine.
                    </p>
                </div>

                <AnalyticsDashboard />

            </main>

            {/* ── Background Glow ────────────────────────────────────────────── */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-velvet-600/10 blur-[120px] rounded-full -z-10" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-velvet-900/10 blur-[120px] rounded-full -z-10" />
        </div>
    )
}
