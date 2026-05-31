import { useCallback } from 'react'
import {
  uploadAvatar as uploadAvatarClient,
  uploadMemeImage as uploadMemeImageClient,
} from '../lib/supabaseClient'

interface UseUploadResult {
  uploadMemeImage: (userId: string, file: File) => Promise<string>
  uploadAvatar: (userId: string, file: File) => Promise<string>
}

export function useUpload(): UseUploadResult {
  const uploadMemeImage = useCallback(
    async (userId: string, file: File): Promise<string> => {
      return uploadMemeImageClient(userId, file)
    },
    [],
  )

  const uploadAvatar = useCallback(
    async (userId: string, file: File): Promise<string> => {
      return uploadAvatarClient(userId, file)
    },
    [],
  )

  return {
    uploadMemeImage,
    uploadAvatar,
  }
}
