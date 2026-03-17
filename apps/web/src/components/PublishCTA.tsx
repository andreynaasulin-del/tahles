'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'

export function PublishCTA() {
  const { t, locale } = useTranslation()

  const deepLink = `https://t.me/Tahlesbot?start=publish_${locale}`

  return (
    <a
      href={deepLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-2 mb-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-velvet-500/20 to-velvet-500/10 border border-velvet-500/30 hover:border-velvet-500/50 hover:from-velvet-500/30 hover:to-velvet-500/15 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-black text-velvet-300 group-hover:text-velvet-200 transition-colors">
            📤 {t('publish_title')}
          </span>
          <p className="text-xs text-white/40 mt-0.5">{t('publish_subtitle')}</p>
        </div>
        <span className="text-white/30 group-hover:text-white/50 transition-colors text-lg">→</span>
      </div>
    </a>
  )
}
