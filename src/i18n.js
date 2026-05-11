import { createContext, useContext, useState, useCallback } from 'react'
import en from './locales/en.json'
import es from './locales/es.json'

const translations = { en, es }

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState('en')

  const setLocale = useCallback((lang) => {
    if (translations[lang] && lang !== locale) {
      setLocaleState(lang)
    }
  }, [locale])

  /**
   * t(key) — simple flat key lookup with fallback to key name.
   * Supports nested keys using dot notation: t('nav.dashboard')
   */
  const t = useCallback((key) => {
    const parts = key.split('.')
    let result = translations[locale]
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part]
      } else {
        return key // fallback to key name
      }
    }
    return typeof result === 'string' ? result : key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

// Alias for ergonomic usage: const { t } = useTranslation()
export const useTranslation = useI18n