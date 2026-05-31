import { useCallback, useEffect, useState } from 'react'
import { deleteUserMeme, getFeed } from '../lib/supabaseClient'
import type { MemeWithProfile } from '../lib/types'
import { useAuth } from './useAuth'

const PAGE_SIZE = 20
const FEED_ERROR_MESSAGE = 'Failed to load feed, please try again'

interface UseFeedResult {
  memes: MemeWithProfile[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  nextCursor: string | null
  hasMore: boolean
  language: string | null
  deletingMemeId: string | null
  loadMore: () => Promise<void>
  filterByLanguage: (lang: string | null) => Promise<void>
  deleteMeme: (memeId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useFeed(): UseFeedResult {
  const { user: currentUser } = useAuth()
  const [memes, setMemes] = useState<MemeWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [language, setLanguage] = useState<string | null>(null)
  const [deletingMemeId, setDeletingMemeId] = useState<string | null>(null)

  const fetchFirstPage = useCallback(async (nextLanguage: string | null) => {
    setLoading(true)
    setError(null)
    setMemes([])
    setNextCursor(null)
    setHasMore(false)

    try {
      const page = await getFeed({
        limit: PAGE_SIZE,
        language: nextLanguage ?? undefined,
      })

      setMemes(page.memes)
      setNextCursor(page.nextCursor)
      setHasMore(page.nextCursor !== null)
    } catch {
      setError(FEED_ERROR_MESSAGE)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchFirstPage(null)
  }, [fetchFirstPage])

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || loadingMore || !nextCursor) {
      return
    }

    setLoadingMore(true)
    setError(null)

    try {
      const page = await getFeed({
        cursor: nextCursor,
        limit: PAGE_SIZE,
        language: language ?? undefined,
      })

      setMemes((currentMemes) => [...currentMemes, ...page.memes])
      setNextCursor(page.nextCursor)
      setHasMore(page.nextCursor !== null)
    } catch {
      setError(FEED_ERROR_MESSAGE)
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, language, loadingMore, nextCursor])

  const filterByLanguage = useCallback(
    async (lang: string | null): Promise<void> => {
      setLanguage(lang)
      await fetchFirstPage(lang)
    },
    [fetchFirstPage],
  )

  const refresh = useCallback(async (): Promise<void> => {
    setLanguage(null)
    await fetchFirstPage(null)
  }, [fetchFirstPage])

  const deleteMeme = useCallback(
    async (memeId: string): Promise<void> => {
      if (!currentUser) {
        setError('Sign in to delete your meme')
        return
      }

      const meme = memes.find((currentMeme) => currentMeme.id === memeId)

      if (!meme || meme.user_id !== currentUser.id) {
        setError('You can only delete your own memes')
        return
      }

      setDeletingMemeId(memeId)
      setError(null)

      try {
        await deleteUserMeme(memeId, currentUser.id)
        setMemes((currentMemes) =>
          currentMemes.filter((currentMeme) => currentMeme.id !== memeId),
        )
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Failed to delete meme',
        )
      } finally {
        setDeletingMemeId(null)
      }
    },
    [currentUser, memes],
  )

  return {
    memes,
    loading,
    loadingMore,
    error,
    nextCursor,
    hasMore,
    language,
    deletingMemeId,
    loadMore,
    filterByLanguage,
    deleteMeme,
    refresh,
  }
}
