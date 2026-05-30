export type Locale = 'en' | 'ne' | 'hi' | 'ru' | 'zh'

export interface MemeWithProfile {
  id: string
  user_id: string
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
