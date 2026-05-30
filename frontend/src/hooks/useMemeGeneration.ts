import { useCallback, useState } from 'react'
import type { MemeAIResult } from '../lib/types'
import { useAuth } from './useAuth'

const VALID_LANGUAGES = ['en', 'ne', 'hi', 'ru', 'zh'] as const
const TIMEOUT_MS = 30_000

type ValidLanguage = (typeof VALID_LANGUAGES)[number]

function isValidLanguage(lang: string): lang is ValidLanguage {
  return (VALID_LANGUAGES as readonly string[]).includes(lang)
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const { message } = body as { message: unknown }
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

export function useMemeGeneration() {
  const { session } = useAuth()

  const [generating, setGenerating]           = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [result, setResult]                   = useState<MemeAIResult | null>(null)
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null)

  const generateMeme = useCallback(
    async (userPrompt: string, language: string): Promise<MemeAIResult | null> => {
      // 1. Auth check
      if (!session?.access_token) {
        setError('Please sign in first')
        return null
      }

      // 2. Input validation
      if (!userPrompt.trim()) {
        setError('Please enter a prompt')
        return null
      }

      if (!isValidLanguage(language)) {
        setError('Invalid language selected')
        return null
      }

      // 3. Start loading
      setGenerating(true)
      setError(null)
      setResult(null)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

      try {
        // 4. Call Edge Function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-meme`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ userPrompt: userPrompt.trim(), language }),
            signal: controller.signal,
          },
        )

        clearTimeout(timeout)

        // 5. Handle error responses
        if (!response.ok) {
          const body: unknown = await response.json().catch(() => ({}))
          const message = response.status === 504
            ? 'Generation timed out — please try again'
            : extractErrorMessage(body, 'Failed to generate meme')
          setError(message)
          setGenerating(false)
          return null
        }

        // 6. Parse success
        const data: MemeAIResult = await response.json() as MemeAIResult
        setResult(data)
        setGenerating(false)
        return data
      } catch {
        // 7. Network error or AbortController timeout
        clearTimeout(timeout)
        setError('Something went wrong, please try again')
        setGenerating(false)
        return null
      }
    },
    [session?.access_token],
  )

  const selectCaption = useCallback((caption: string): void => {
    setSelectedCaption(caption)
  }, [])

  const reset = useCallback((): void => {
    setGenerating(false)
    setError(null)
    setResult(null)
    setSelectedCaption(null)
  }, [])

  return {
    generating,
    error,
    result,
    selectedCaption,
    generateMeme,
    selectCaption,
    reset,
  }
}
