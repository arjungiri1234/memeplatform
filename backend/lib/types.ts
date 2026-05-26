export type Locale = 'en' | 'ne' | 'hi' | 'ru' | 'zh'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  locale: Locale
  created_at: string
}

export interface Template {
  id: string
  name: string
  image_url: string
  category: string | null
  created_at: string
}

export interface Meme {
  id: string
  user_id: string
  template_id: string | null
  title: string | null
  image_url: string
  language: string
  view_count: number
  created_at: string
}

export interface MemeWithProfile extends Meme {
  profiles: Pick<Profile, 'username' | 'avatar_url'>
}

export interface MemeAIResult {
  imageUrl: string
  captions: string[]
}

export interface FeedPage {
  memes: MemeWithProfile[]
  nextCursor: string | null
}
