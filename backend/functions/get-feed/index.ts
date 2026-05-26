import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../../lib/cors.ts'
import type { FeedOutput, MemeWithProfile } from '../../lib/types.ts'

const SUPPORTED_LANGUAGES = ['en', 'ne', 'hi', 'ru', 'zh'] as const

interface FeedRow {
  id: string
  title: string | null
  image_url: string
  language: string
  view_count: number
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
  } | Array<{
    username: string
    avatar_url: string | null
  }> | null
}

function isSupportedLanguage(language: string): boolean {
  return SUPPORTED_LANGUAGES.includes(
    language as (typeof SUPPORTED_LANGUAGES)[number],
  )
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  })
}

function normalizeProfile(
  profile: FeedRow['profiles'],
): MemeWithProfile['profiles'] {
  if (Array.isArray(profile)) {
    return profile[0] ?? { username: 'unknown', avatar_url: null }
  }

  return profile ?? { username: 'unknown', avatar_url: null }
}

function normalizeMeme(row: FeedRow): MemeWithProfile {
  return {
    id: row.id,
    title: row.title,
    image_url: row.image_url,
    language: row.language,
    view_count: row.view_count,
    created_at: row.created_at,
    profiles: normalizeProfile(row.profiles),
  }
}

serve(async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    if (req.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    if (!supabaseUrl || !anonKey) {
      return jsonResponse({ error: 'Server configuration error' }, 500)
    }

    const url = new URL(req.url)
    const cursor = url.searchParams.get('cursor')
    const limitParam = url.searchParams.get('limit')
    const language = url.searchParams.get('language')
    const parsedLimit = Number.parseInt(limitParam ?? '20', 10)
    const limit = Math.min(
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20,
      50,
    )
    const supabase = createClient(supabaseUrl, anonKey)

    let query = supabase
      .from('memes')
      .select(`
        id,
        title,
        image_url,
        language,
        view_count,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit + 1)

    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    if (language && isSupportedLanguage(language)) {
      query = query.eq('language', language)
    }

    const { data, error } = await query

    if (error) {
      console.error('get-feed query error:', error)
      return jsonResponse({ error: 'Failed to fetch feed' }, 500)
    }

    const memes = (data ?? []) as FeedRow[]
    const hasMore = memes.length > limit
    const items = (hasMore ? memes.slice(0, limit) : memes).map(normalizeMeme)
    const nextCursor = hasMore && items.length > 0
      ? items[items.length - 1].created_at
      : null
    const output: FeedOutput = {
      memes: items,
      nextCursor,
      total: items.length,
    }

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('get-feed error:', error)
    return jsonResponse({ error: 'Failed to fetch feed' }, 500)
  }
})
