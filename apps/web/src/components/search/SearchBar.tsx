'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const { t } = useTranslation()
  const [value, setValue]       = useState('')
  const [focused, setFocused]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const inputRef    = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // live search on typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (value.trim()) onSearch(value)
    }, 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
    inputRef.current?.blur()
  }, [value, onSearch])

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className={`
          flex items-center rounded-2xl transition-all duration-200
          ${focused
            ? 'bg-white/[0.08] border-velvet-500/40 shadow-lg shadow-velvet-500/10'
            : 'bg-white/[0.05] border-white/[0.1] hover:bg-white/[0.07]'}
          border
        `}>
          <div className="pl-4 sm:pl-5 pr-2 text-white/25 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t('search_placeholder')}
            className="flex-1 py-3.5 sm:py-4 pr-2 text-sm sm:text-base bg-transparent text-white placeholder:text-white/25 focus:outline-none font-medium min-w-0"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && (
            <div className="pr-3 shrink-0">
              <div className="w-4 h-4 border-2 border-white/20 border-t-velvet-400 rounded-full animate-spin" />
            </div>
          )}
          {value && !loading && (
            <button
              type="button"
              onClick={() => { setValue(''); onSearch('') }}
              className="pr-2 text-white/20 hover:text-white/50 transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
          <button
            type="submit"
            className="bg-velvet-500 text-white px-5 sm:px-7 py-3.5 sm:py-4 rounded-r-2xl text-sm font-semibold hover:bg-velvet-600 transition-colors whitespace-nowrap shrink-0"
          >
            <span className="hidden sm:inline">{t('search_btn')}</span>
            <span className="sm:hidden">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
