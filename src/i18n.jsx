// ═════════════════════════════════════════════════════════════════════════════
// I18N.JSX — Sistema de Internacionalización (Multi-idioma)
// ═════════════════════════════════════════════════════════════════════════════
// Proporciona un Context global para traducir toda la app entre español (es)
// e inglés (en). Soporta claves anidadas con notación de punto: t('nav.home')

import { createContext, useContext, useState, useCallback } from 'react'
import en from './locales/en.json'  // Diccionario inglés
import es from './locales/es.json'  // Diccionario español

// Tabla de traducción: { 'en': { ... }, 'es': { ... } }
const translations = { en, es }

// Context compartido a nivel global
const I18nContext = createContext(null)

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ I18nProvider — Inicializa el Context de idioma                              │
// └─────────────────────────────────────────────────────────────────────────────┘
export function I18nProvider({ children }) {
  // Estado del idioma actual (por defecto 'en')
  const [locale, setLocaleState] = useState('en')

  // Cambia el idioma si es válido y diferente del actual
  const setLocale = useCallback((lang) => {
    if (translations[lang] && lang !== locale) {
      setLocaleState(lang)
    }
  }, [locale])

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ Función de traducción: t(key)                                           │
  // └─────────────────────────────────────────────────────────────────────────┘
  // Busca una clave en el diccionario del idioma actual.
  // Soporta claves anidadas con notación de punto:
  //   t('nav.home')     → traduce 'nav' > 'home'
  //   t('buttons.ok')   → traduce 'buttons' > 'ok'
  // 
  // Fallback: Si la clave no existe, devuelve la clave misma (útil en desarrollo)
  const t = useCallback((key) => {
    const parts = key.split('.')  // Divide 'nav.home' en ['nav', 'home']
    let result = translations[locale]  // Empieza en el diccionario del idioma
    
    // Navega por las partes anidadas
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part]
      } else {
        return key // Si no existe, devuelve la clave (fallback)
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