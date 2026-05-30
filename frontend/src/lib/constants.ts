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
  FEED: '/feed',
  CREATE: '/create',
  EDITOR: '/editor',
  PROFILE: '/profile',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  MEME: '/meme',
} as const

export const AUTH_REDIRECT_STORAGE_KEY = 'memeit-auth-redirect'

export function getLoginRoute({
  mode,
  redirectTo,
}: {
  mode?: 'signin' | 'signup'
  redirectTo?: string
} = {}): string {
  const searchParams = new URLSearchParams()

  if (mode) {
    searchParams.set('mode', mode)
  }

  if (redirectTo) {
    searchParams.set('redirect', redirectTo)
  }

  const query = searchParams.toString()
  return query ? `${ROUTES.LOGIN}?${query}` : ROUTES.LOGIN
}

export function getSafeAuthRedirect(redirectTo: string | null | undefined): string {
  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return ROUTES.FEED
  }

  return redirectTo
}
