import { createClient } from '@supabase/supabase-js'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import type { AuthResult, FeedPage, Meme, Profile, Template } from './types'

type DbProfile = Profile & Record<string, unknown>
type DbTemplate = Template & Record<string, unknown>
type DbMeme = Meme & Record<string, unknown>

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: DbProfile
        Insert: Omit<Profile, 'created_at'> & {
          created_at?: string
        } & Record<string, unknown>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>> & Record<string, unknown>
        Relationships: []
      }
      templates: {
        Row: DbTemplate
        Insert: Omit<Template, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        } & Record<string, unknown>
        Update: Partial<Omit<Template, 'id' | 'created_at'>> & Record<string, unknown>
        Relationships: []
      }
      memes: {
        Row: DbMeme
        Insert: Omit<Meme, 'id' | 'view_count' | 'created_at'> & {
          id?: string
          view_count?: number
          created_at?: string
        } & Record<string, unknown>
        Update: Partial<Omit<Meme, 'id' | 'user_id' | 'created_at'>> & Record<string, unknown>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

const DEFAULT_ERROR_MESSAGE = 'Something went wrong, please try again'
const CONNECTION_ERROR_MESSAGE = 'Check your connection'

function getErrorMessage(error: unknown): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return CONNECTION_ERROR_MESSAGE
  }

  const message = error instanceof Error ? error.message : ''

  if (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('Load failed')
  ) {
    return CONNECTION_ERROR_MESSAGE
  }

  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password'
  }

  if (message.includes('User already registered')) {
    return 'Email already in use'
  }

  if (message.includes('Password should be at least')) {
    return 'Password must be at least 8 characters'
  }

  if (message.includes('duplicate key') && message.includes('profiles_username')) {
    return 'Username already taken'
  }

  return DEFAULT_ERROR_MESSAGE
}

function isUserCancelledOAuth(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : ''

  return (
    message.includes('popup') ||
    message.includes('cancel') ||
    message.includes('closed')
  )
}

function getDefaultUsername(user: User): string {
  const metadataName = user.user_metadata.name
  const emailName = user.email?.split('@')[0]
  const baseName =
    typeof metadataName === 'string' && metadataName.trim() !== ''
      ? metadataName
      : emailName ?? `user_${user.id.replace(/-/g, '').slice(0, 8)}`

  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  return sanitized || `user_${user.id.replace(/-/g, '').slice(0, 8)}`
}

export async function signInWithGoogle(): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error && !isUserCancelledOAuth(error)) {
      throw new Error(getErrorMessage(error))
    }
  } catch (error) {
    if (!isUserCancelledOAuth(error)) {
      throw new Error(getErrorMessage(error))
    }
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        user: null,
        error: getErrorMessage(error),
      }
    }

    return {
      user: data.user,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      error: getErrorMessage(error),
    }
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult> {
  try {
    const { data: existingProfile, error: usernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (usernameError) {
      return {
        user: null,
        error: getErrorMessage(usernameError),
      }
    }

    if (existingProfile) {
      return {
        user: null,
        error: 'Username already taken',
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (error) {
      return {
        user: null,
        error: getErrorMessage(error),
      }
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        avatar_url: null,
        locale: 'en',
      })

      if (profileError) {
        return {
          user: null,
          error: getErrorMessage(profileError),
        }
      }
    }

    return {
      user: data.user,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      error: getErrorMessage(error),
    }
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    localStorage.removeItem('memeit-auth')

    if (error) {
      throw new Error(getErrorMessage(error))
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return null
    }

    return data.session
  } catch {
    return null
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      return null
    }

    return data
  } catch {
    return null
  }
}

export async function getFeed(options?: {
  cursor?: string
  limit?: number
  language?: string
}): Promise<FeedPage> {
  const searchParams = new URLSearchParams()

  searchParams.set('limit', String(options?.limit ?? 20))

  if (options?.cursor) {
    searchParams.set('cursor', options.cursor)
  }

  if (options?.language) {
    searchParams.set('language', options.language)
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-feed?${searchParams.toString()}`,
      { method: 'GET' },
    )

    if (!response.ok) {
      throw new Error('Feed request failed')
    }

    return await response.json() as FeedPage
  } catch {
    throw new Error('Failed to load feed, please try again')
  }
}

export async function getTemplates(category?: string | null): Promise<Template[]> {
  try {
    let query = supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: true })

    if (category != null) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data
  } catch {
    throw new Error('Failed to load templates')
  }
}

export async function uploadMemeImage(
  userId: string,
  file: File,
): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${timestamp}-${crypto.randomUUID()}.png`
  const filePath = `${userId}/${fileName}`

  try {
    const { error } = await supabase.storage
      .from('memes')
      .upload(filePath, file, {
        contentType: file.type || 'image/png',
        upsert: false,
      })

    if (error) {
      throw error
    }

    const { data } = supabase.storage.from('memes').getPublicUrl(filePath)

    return data.publicUrl
  } catch {
    throw new Error('Failed to upload meme image')
  }
}

export async function insertMeme(data: {
  userId: string
  imageUrl: string
  title: string | null
  language: string
  templateId?: string
}): Promise<Meme> {
  try {
    const { data: meme, error } = await supabase
      .from('memes')
      .insert({
        user_id: data.userId,
        image_url: data.imageUrl,
        title: data.title,
        language: data.language,
        template_id: data.templateId ?? null,
      })
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return meme
  } catch {
    throw new Error('Failed to publish meme')
  }
}

export async function ensureProfile(user: User): Promise<Profile | null> {
  const existingProfile = await getProfile(user.id)

  if (existingProfile) {
    return existingProfile
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: getDefaultUsername(user),
        avatar_url: null,
        locale: 'en',
      })
      .select('*')
      .single()

    if (error) {
      return null
    }

    return data
  } catch {
    return null
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<Profile>,
): Promise<Profile | null> {
  const updateData: Database['public']['Tables']['profiles']['Update'] = {
    username: data.username,
    avatar_url: data.avatar_url,
    locale: data.locale,
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .maybeSingle()

    if (error) {
      return null
    }

    return profile
  } catch {
    return null
  }
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      callback(event, session)
    },
  )

  return () => {
    data.subscription.unsubscribe()
  }
}
