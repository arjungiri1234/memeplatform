import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { GenerateMemeOutput } from '../types.ts'
import { generateCaptionsAndPrompt, generateImage } from './gemini.ts'

function getAIProvider(): string {
  return Deno.env.get('AI_PROVIDER') ?? 'gemini'
}

function base64ToBytes(base64ImageData: string): Uint8Array {
  return Uint8Array.from(
    atob(base64ImageData),
    (character) => character.charCodeAt(0),
  )
}

export async function generateMemeAI(
  userPrompt: string,
  language: string,
  userId: string,
  supabaseClient: SupabaseClient,
): Promise<GenerateMemeOutput> {
  const provider = getAIProvider()

  if (provider !== 'gemini') {
    throw new Error('Unknown AI_PROVIDER')
  }

  const { imagePrompt, captions } = await generateCaptionsAndPrompt(
    userPrompt,
    language,
  )
  const base64ImageData = await generateImage(imagePrompt)
  const bytes = base64ToBytes(base64ImageData)
  const path = `generated/${userId}/${Date.now()}.png`

  const { error: uploadError } = await supabaseClient.storage
    .from('memes')
    .upload(path, bytes, {
      contentType: 'image/png',
      upsert: false,
    })

  if (uploadError) {
    throw new Error('Storage upload failed')
  }

  const { data } = supabaseClient.storage
    .from('memes')
    .getPublicUrl(path)

  return {
    imageUrl: data.publicUrl,
    captions,
    imagePrompt,
  }
}
