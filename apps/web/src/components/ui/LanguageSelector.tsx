'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { LOCALES, type Locale } from '@/lib/i18n/translations'

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = LOCALES.find((l) => l.id === locale)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.04] transition-colors text-sm"
        aria-label="Select language"
      >
        <span className="text-base leading-none">{current?.flag}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/30">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1 w-36 rounded-xl bg-surface-100 border border-white/10 shadow-xl z-[100] overflow-hidden animate-suggest-in">
          {LOCALES.map((l) => (
            <button
              key={l.id}
              onClick={() => { setLocale(l.id as Locale); setOpen(false) }}
              className={`flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left transition-colors ${
                locale === l.id
                  ? 'bg-velvet-500/20 text-velvet-300 font-semibold'
                  : 'text-white/60 hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="text-[12px] font-medium">{l.label}</span>
              {locale === l.id && <span className="ms-auto text-[10px] text-velvet-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
