'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'

const BOT_USERNAME = 'Tahlesbot'

export function PublishCTA() {
  const { t, locale } = useTranslation()
  const deepLink = `https://t.me/${BOT_USERNAME}?start=publish_${locale}`

  return (
    <a
      href={deepLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-2 mb-3 flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-velvet-500/20 to-velvet-500/10 border border-velvet-500/40 hover:border-velvet-400/70 hover:from-velvet-500/30 hover:to-velvet-500/15 transition-all duration-200 cursor-pointer"
    >
      {/* Left: text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-velvet-300 group-hover:text-velvet-200 transition-colors">
          {t('publish_title')}
        </p>
        <p className="text-xs text-white/40 mt-0.5">{t('publish_subtitle')}</p>
      </div>

      {/* Right: button */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-velvet-500 group-hover:bg-velvet-400 transition-all duration-200 shadow-lg shadow-velvet-500/30">
        {/* Telegram icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="shrink-0">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        <span className="text-sm font-bold text-white whitespace-nowrap">
          {locale === 'he' ? 'פרסמי עכשיו →' : locale === 'ru' ? 'Опубликовать →' : 'Publish now →'}
        </span>
      </div>
    </a>
  )
}
