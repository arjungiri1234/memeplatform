import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, handleCors } from '../../lib/cors.ts'
import { generateMemeAI } from '../../lib/ai/provider.ts'
import type {
  GenerateMemeInput,
  GenerateMemeOutput,
} from '../../lib/types.ts'

const SUPPORTED_LANGUAGES = ['en', 'ne', 'hi', 'ru', 'zh'] as const

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

async function parseGenerateMemeInput(req: Request): Promise<GenerateMemeInput> {
  try {
    return await req.json() as GenerateMemeInput
  } catch {
    throw new Error('Invalid JSON body')
  }
}

serve(async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return jsonResponse({ error: 'Authentication required' }, 401)
    }

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse({ error: 'Server configuration error' }, 500)
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabaseUser.auth
      .getUser()

    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401)
    }

    const body = await parseGenerateMemeInput(req)

    if (!body.userPrompt || body.userPrompt.trim().length === 0) {
      return jsonResponse({ error: 'Prompt is required' }, 400)
    }

    if (!body.language || !isSupportedLanguage(body.language)) {
      return jsonResponse({ error: 'Invalid language code' }, 400)
    }

    const result: GenerateMemeOutput = await generateMemeAI(
      body.userPrompt,
      body.language,
      user.id,
      supabaseAdmin,
    )

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('generate-meme error:', error)

    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message === 'Invalid JSON body') {
      return jsonResponse({ error: 'Invalid request body' }, 400)
    }

    if (message.includes('timed out')) {
      return jsonResponse({ error: 'Generation timed out, please retry' }, 504)
    }

    return jsonResponse(
      { error: 'Failed to generate meme, please try again' },
      500,
    )
  }
})
