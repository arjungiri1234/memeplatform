import { useCallback } from 'react'
import { uploadMemeImage as uploadMemeImageClient } from '../lib/supabaseClient'

interface UseUploadResult {
  uploadMemeImage: (userId: string, file: File) => Promise<string>
}

export function useUpload(): UseUploadResult {
  const uploadMemeImage = useCallback(
    async (userId: string, file: File): Promise<string> => {
      return uploadMemeImageClient(userId, file)
    },
    [],
  )

  return {
    uploadMemeImage,
  }
}
