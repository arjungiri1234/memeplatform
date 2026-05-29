import { useCallback, useState } from 'react'
import { insertMeme } from '../lib/supabaseClient'
import { useAuth } from './useAuth'
import { useUpload } from './useUpload'

interface PublishOptions {
  canvasDataUrl: string
  title: string | null
  language: string
  templateId?: string
}

interface UsePublishResult {
  publishing: boolean
  published: boolean
  error: string | null
  publishedMemeId: string | null
  publish: (options: PublishOptions) => Promise<boolean>
  reset: () => void
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()

  return new File([blob], 'meme.png', { type: 'image/png' })
}

export function usePublish(): UsePublishResult {
  const { user } = useAuth()
  const { uploadMemeImage } = useUpload()
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publishedMemeId, setPublishedMemeId] = useState<string | null>(null)

  const reset = useCallback(() => {
    setPublishing(false)
    setPublished(false)
    setError(null)
    setPublishedMemeId(null)
  }, [])

  const publish = useCallback(
    async ({ canvasDataUrl, title, language, templateId }: PublishOptions): Promise<boolean> => {
      setPublishing(true)
      setError(null)
      setPublished(false)
      setPublishedMemeId(null)

      if (!user) {
        setError('Sign in to publish your meme')
        setPublishing(false)
        return false
      }

      try {
        const file = await dataUrlToFile(canvasDataUrl)
        const imageUrl = await uploadMemeImage(user.id, file)
        const meme = await insertMeme({
          userId: user.id,
          imageUrl,
          title,
          language,
          templateId,
        })

        setPublishedMemeId(meme.id)
        setPublished(true)
        setPublishing(false)
        return true
      } catch {
        setError('Failed to publish meme')
        setPublishing(false)
        return false
      }
    },
    [uploadMemeImage, user],
  )

  return {
    publishing,
    published,
    error,
    publishedMemeId,
    publish,
    reset,
  }
}
