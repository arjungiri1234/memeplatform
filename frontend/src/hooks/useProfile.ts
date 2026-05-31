import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteUserMeme,
  getProfile,
  getProfileByUsername,
  getUserMemes,
  updateProfile as updateProfileClient,
} from '../lib/supabaseClient'
import type { Meme, Profile } from '../lib/types'
import { useAuth } from './useAuth'

interface UseProfileResult {
  profile: Profile | null
  memes: Meme[]
  loading: boolean
  error: string | null
  isOwnProfile: boolean
  deleteMeme: (memeId: string) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<Profile | null>
  refresh: () => void
}

export function useProfile(userId: string, username?: string): UseProfileResult {
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const targetUserId = profile?.id ?? userId
  const isOwnProfile = targetUserId === currentUser?.id

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [nextProfile, nextMemes] = username
        ? await getProfileByUsername(username).then(async (profileByUsername) => {
            const memesByUsername = profileByUsername
              ? await getUserMemes(profileByUsername.id)
              : []

            return [profileByUsername, memesByUsername] as const
          })
        : await Promise.all([
            getProfile(userId),
            getUserMemes(userId),
          ])

      if (!isMountedRef.current) return

      setProfile(nextProfile)
      setMemes(nextMemes)
    } catch (caughtError) {
      if (!isMountedRef.current) return

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to load profile',
      )
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [userId, username])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const deleteMeme = useCallback(
    async (memeId: string): Promise<void> => {
      setError(null)

      try {
        await deleteUserMeme(memeId, targetUserId)

        if (!isMountedRef.current) return

        setMemes((currentMemes) =>
          currentMemes.filter((meme) => meme.id !== memeId),
        )
      } catch (caughtError) {
        if (!isMountedRef.current) return

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Failed to delete meme',
        )
      }
    },
    [targetUserId],
  )

  const refresh = useCallback(() => {
    void fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(
    async (data: Partial<Profile>): Promise<Profile | null> => {
      setError(null)

      try {
        const updatedProfile = await updateProfileClient(targetUserId, data)

        if (!isMountedRef.current) return updatedProfile

        if (updatedProfile) {
          setProfile(updatedProfile)
        }

        return updatedProfile
      } catch (caughtError) {
        if (isMountedRef.current) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Failed to update profile',
          )
        }

        return null
      }
    },
    [targetUserId],
  )

  return {
    profile,
    memes,
    loading,
    error,
    isOwnProfile,
    deleteMeme,
    updateProfile,
    refresh,
  }
}
