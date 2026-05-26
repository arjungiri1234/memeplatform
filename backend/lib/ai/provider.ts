import type { MemeAIResult } from '../types.ts'
import { generateWithGemini } from './gemini.ts'

type AIProvider = 'gemini' | 'production'

function getAIProvider(): AIProvider {
  const provider = Deno.env.get('AI_PROVIDER') ?? 'gemini'

  if (provider === 'gemini' || provider === 'production') {
    return provider
  }

  throw new Error(`Unknown AI_PROVIDER: ${provider}`)
}

export async function generateMemeAI(
  userPrompt: string,
  language: string,
): Promise<MemeAIResult> {
  const provider = getAIProvider()

  if (provider === 'gemini') {
    return generateWithGemini(userPrompt, language)
  }

  // TODO: implement production provider
  throw new Error('Production AI provider is not implemented')
}
