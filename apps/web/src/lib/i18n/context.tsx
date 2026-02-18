'use client'

import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { translations, LOCALES, type Locale, type TranslationKey } from './translations'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
  dir: 'ltr' | 'rtl'
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  dir: 'ltr',
})

const STORAGE_KEY = 'vm_locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && translations[saved]) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] ?? translations.en[key] ?? key
    },
    [locale]
  )

  const dir = LOCALES.find((l) => l.id === locale)?.dir ?? 'ltr'

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale, dir])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  )
}
