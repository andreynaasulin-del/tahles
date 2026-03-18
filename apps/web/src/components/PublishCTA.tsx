'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'

const BOT_USERNAME = 'Tahlesbot'

export function PublishCTA() {
  const { t, locale } = useTranslation()
  const widgetRef = useRef<HTMLDivElement>(null)

  const handleTelegramAuth = useCallback((user: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
  }) => {
    // User authenticated via Telegram — redirect to bot with publish deep-link
    const deepLink = `https://t.me/${BOT_USERNAME}?start=publish_${locale}`
    window.open(deepLink, '_blank')
  }, [locale])

  useEffect(() => {
    // Expose callback globally for Telegram widget
    ;(window as any).onTelegramAuth = handleTelegramAuth

    // Create Telegram Login Widget script
    if (widgetRef.current && !widgetRef.current.querySelector('script')) {
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?22'
      script.setAttribute('data-telegram-login', BOT_USERNAME)
      script.setAttribute('data-size', 'large')
      script.setAttribute('data-radius', '16')
      script.setAttribute('data-request-access', 'write')
      script.setAttribute('data-onauth', 'onTelegramAuth(user)')
      script.async = true
      widgetRef.current.appendChild(script)
    }

    return () => {
      delete (window as any).onTelegramAuth
    }
  }, [handleTelegramAuth])

  // Fallback deep-link for mobile / if widget doesn't load
  const deepLink = `https://t.me/${BOT_USERNAME}?start=publish_${locale}`

  return (
    <div className="mt-2 mb-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-velvet-500/20 to-velvet-500/10 border border-velvet-500/30 hover:border-velvet-500/50 transition-all duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <span className="text-sm font-black text-velvet-300">
            {t('publish_title')}
          </span>
          <p className="text-xs text-white/40 mt-0.5">{t('publish_subtitle')}</p>
        </div>
        {/* Telegram Login Widget container */}
        <div ref={widgetRef} className="shrink-0" />
      </div>
      {/* Mobile fallback — direct deep-link */}
      <a
        href={deepLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2AABEE]/20 border border-[#2AABEE]/30 hover:bg-[#2AABEE]/30 transition-all text-[#2AABEE] text-sm font-bold sm:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        {t('publish_title')}
      </a>
    </div>
  )
}
