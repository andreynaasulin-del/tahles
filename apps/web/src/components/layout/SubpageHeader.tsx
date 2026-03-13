'use client'

import { LanguageSelector } from '@/components/ui/LanguageSelector'

function TahlesLogo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#d85078" />
      <text x="20" y="27" textAnchor="middle" fontFamily="Inter,-apple-system,sans-serif" fontWeight="900" fontSize="19" fill="white" letterSpacing="-0.5">T</text>
      <text x="27.5" y="35" textAnchor="middle" fontSize="8" fill="white" opacity="0.9">&#9733;</text>
    </svg>
  )
}

interface Breadcrumb {
  label: string
  href?: string
}

interface SubpageHeaderProps {
  count?: number
  breadcrumbs: Breadcrumb[]
}

export function SubpageHeader({ count, breadcrumbs }: SubpageHeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-[1100px] mx-auto">
          <a href="/" className="flex items-center gap-2.5 select-none">
            <TahlesLogo size={30} />
            <span className="text-lg font-bold bg-gradient-to-r from-velvet-400 to-velvet-300 bg-clip-text text-transparent">
              Tahles
            </span>
          </a>
          <div className="flex items-center gap-3">
            {count !== undefined && count > 0 && (
              <span className="text-xs font-black text-white/40 uppercase tracking-widest tabular-nums">
                {count.toLocaleString()} profiles
              </span>
            )}
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-3 pb-1">
        <div className="flex items-center gap-2 text-xs text-white/40">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-white/20">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-white/70 transition">{crumb.label}</a>
              ) : (
                <span className="text-white/60">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </nav>
    </>
  )
}
