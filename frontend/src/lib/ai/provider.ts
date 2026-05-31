import type { MemeAIResult } from '../types'

interface GenerateMemeOptions {
  userPrompt: string
  language: string
  userId: string
  accessToken: string
}

export async function generateMemeAI(
  options: GenerateMemeOptions,
): Promise<MemeAIResult> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-meme`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: options.userPrompt,
          language: options.language,
          userId: options.userId,
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Generation failed')
    }

    return await response.json() as MemeAIResult
  } catch {
    throw new Error('Failed to generate meme, please try again')
  }
}
