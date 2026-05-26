import { createClient } from '@supabase/supabase-js'
import type { Meme, Profile, Template } from './types'

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      templates: {
        Row: Template
        Insert: Omit<Template, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Template, 'id' | 'created_at'>>
      }
      memes: {
        Row: Meme
        Insert: Omit<Meme, 'id' | 'view_count' | 'created_at'> & {
          id?: string
          view_count?: number
          created_at?: string
        }
        Update: Partial<Omit<Meme, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// TODO: implement typed DB functions (getFeed, getProfile, saveMeme, etc.)
