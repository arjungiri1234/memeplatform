import { useCallback, useState } from 'react'
import { generateMemeAI } from '../lib/ai/provider'
import type { MemeAIResult } from '../lib/types'
import { useAuth } from './useAuth'

interface GenerateOptions {
  userPrompt: string
  language: string
}

interface UseMemeGenerationResult {
  generating: boolean
  error: string | null
  generate: (options: GenerateOptions) => Promise<MemeAIResult | null>
  reset: () => void
}

export function useMemeGeneration(): UseMemeGenerationResult {
  const { user, session } = useAuth()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setGenerating(false)
    setError(null)
  }, [])

  const generate = useCallback(
    async ({ userPrompt, language }: GenerateOptions): Promise<MemeAIResult | null> => {
      const prompt = userPrompt.trim()

      if (!prompt) {
        setError('Describe your meme first')
        return null
      }

      if (!user || !session?.access_token) {
        setError('Sign in to generate a meme')
        return null
      }

      setGenerating(true)
      setError(null)

      try {
        const result = await generateMemeAI({
          userPrompt: prompt,
          language,
          userId: user.id,
          accessToken: session.access_token,
        })

        setGenerating(false)
        return result
      } catch {
        setError('Failed to generate meme, please try again')
        setGenerating(false)
        return null
      }
    },
    [session?.access_token, user],
  )

  return {
    generating,
    error,
    generate,
    reset,
  }
}
