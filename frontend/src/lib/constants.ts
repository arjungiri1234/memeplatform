import type { Locale } from './types'

export interface LanguageOption {
  code: Locale
  label: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'ne', label: 'नेपाली' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
]

export const ROUTES = {
  HOME: '/',
  CREATE: '/create',
  EDITOR: '/editor',
  PROFILE: '/profile',
  LOGIN: '/login',
} as const
