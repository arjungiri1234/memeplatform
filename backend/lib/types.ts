export type Locale = 'en' | 'ne' | 'hi' | 'ru' | 'zh'

export interface GenerateMemeInput {
  userPrompt: string
  language: Locale
  userId: string
}

export interface GeminiTextResponse {
  imagePrompt: string
  captions: string[]
}

export interface GenerateMemeOutput {
  imageUrl: string
  captions: string[]
  imagePrompt: string
}

export interface MemeWithProfile {
  id: string
  title: string | null
  image_url: string
  language: string
  view_count: number
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export interface FeedOutput {
  memes: MemeWithProfile[]
  nextCursor: string | null
  total: number
}
