import type { GeminiTextResponse } from '../types.ts'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ne: 'Nepali — write captions in Devanagari script (नेपाली)',
  hi: 'Hindi — write captions in Devanagari script (हिन्दी)',
  ru: 'Russian — write captions in Cyrillic script (Русский)',
  zh: 'Chinese — write captions in Simplified Chinese characters (中文)',
}

const TEXT_MODEL_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const IMAGE_MODEL_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'

interface GeminiPart {
  text?: string
  inlineData?: {
    data?: string
    mimeType?: string
  }
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[]
    }
  }>
}

function getGeminiApiKey(): string {
  const apiKey = Deno.env.get('GEMINI_API_KEY')

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  return apiKey
}

function stripJsonCodeFence(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function isGeminiTextResponse(value: unknown): value is GeminiTextResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<GeminiTextResponse>

  return (
    typeof candidate.imagePrompt === 'string' &&
    Array.isArray(candidate.captions) &&
    candidate.captions.length === 3 &&
    candidate.captions.every((caption) => typeof caption === 'string')
  )
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(timeoutMessage)
    }

    throw new Error('Gemini request failed')
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function generateCaptionsAndPrompt(
  userPrompt: string,
  language: string,
): Promise<GeminiTextResponse> {
  const apiKey = getGeminiApiKey()
  const languageName = LANGUAGE_NAMES[language] ?? `${language} language`
  const prompt = `You are a meme caption writer for a multilingual platform.
The user wrote: '${userPrompt}'
Target language: ${languageName}

Do exactly two things:
1. Translate the prompt to English for image generation.
   If already English keep as is. Make it descriptive and
   visual for an AI image generator. No text in the image.
2. Write exactly 3 short funny meme captions.
   CRITICAL: captions MUST be written in ${languageName}.
   Rules:
   - Max 8 words each
   - Punchy and culturally relevant
   - Never use English for captions unless target language is English
   - Use the correct script for the language (Devanagari, Cyrillic, etc.)

Return ONLY this exact JSON with no markdown or explanation:
{
  "imagePrompt": "english description here",
  "captions": ["caption1", "caption2", "caption3"]
}`

  const response = await fetchWithTimeout(
    `${TEXT_MODEL_URL}?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
      }),
    },
    15000,
    'Gemini request timed out',
  )

  if (!response.ok) {
    throw new Error('Gemini text generation failed')
  }

  const data = await response.json() as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Invalid Gemini response format')
  }

  const parsed = JSON.parse(stripJsonCodeFence(text)) as unknown

  if (!isGeminiTextResponse(parsed)) {
    throw new Error('Invalid Gemini response format')
  }

  return parsed
}

export async function generateImage(imagePrompt: string): Promise<string> {
  const apiKey = getGeminiApiKey()
  const response = await fetchWithTimeout(
    `${IMAGE_MODEL_URL}?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text:
              `${imagePrompt}, meme style, funny, expressive, vibrant colors, high quality, no text, no captions, no words, no watermarks, no letters`,
          }],
        }],
        generationConfig: {
          responseModalities: ['Image'],
        },
      }),
    },
    30000,
    'Gemini request timed out',
  )

  if (!response.ok) {
    throw new Error('Gemini image generation failed')
  }

  const data = await response.json() as GeminiResponse
  const parts = data.candidates?.[0]?.content?.parts ?? []
  const imagePart = parts.find((part) => Boolean(part.inlineData?.data))
  const imageData = imagePart?.inlineData?.data

  if (!imageData) {
    throw new Error('No image generated')
  }

  return imageData
}
