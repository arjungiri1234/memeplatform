import { useCallback, useEffect, useRef, useState } from 'react'
import {
  canNativeShare,
  copyToClipboard,
  downloadMemeImage,
  getFacebookShareUrl,
  getMemeShareUrl,
  getTelegramShareUrl,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  nativeShare,
  openShareWindow,
} from '../lib/shareUtils'

const RESET_DELAY_MS = 2000

interface UseShareProps {
  memeId: string
  title: string | null
  imageUrl?: string
}

interface UseShareResult {
  copied: boolean
  copyError: string | null
  shareUrl: string
  canShare: boolean
  copyLink: () => Promise<void>
  shareToWhatsApp: () => boolean
  shareToFacebook: () => boolean
  shareToTwitter: () => boolean
  shareToTelegram: () => boolean
  shareNative: () => Promise<void>
  download: () => Promise<void>
}

export function useShare({ memeId, title, imageUrl }: UseShareProps): UseShareResult {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear any pending timer on unmount — no memory leaks
  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current)
    }
  }, [])

  const scheduleReset = useCallback((resetFn: () => void) => {
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      resetFn()
      resetTimerRef.current = null
    }, RESET_DELAY_MS)
  }, [])

  const copyLink = useCallback(async (): Promise<void> => {
    const url = getMemeShareUrl(memeId)
    const success = await copyToClipboard(url)

    if (success) {
      setCopied(true)
      setCopyError(null)
      scheduleReset(() => setCopied(false))
    } else {
      setCopyError('Failed to copy link')
      scheduleReset(() => setCopyError(null))
    }
  }, [memeId, scheduleReset])

  const shareToWhatsApp = useCallback((): boolean => {
    const url = getMemeShareUrl(memeId)
    const text = title ?? 'Check out this meme!'
    return openShareWindow(getWhatsAppShareUrl(url, text))
  }, [memeId, title])

  const shareToFacebook = useCallback((): boolean => {
    const url = getMemeShareUrl(memeId)
    return openShareWindow(getFacebookShareUrl(url))
  }, [memeId])

  const shareToTwitter = useCallback((): boolean => {
    const url = getMemeShareUrl(memeId)
    const text = title ?? 'Check out this meme on memeit!'
    return openShareWindow(getTwitterShareUrl(url, text))
  }, [memeId, title])

  const shareToTelegram = useCallback((): boolean => {
    const url = getMemeShareUrl(memeId)
    const text = title ?? 'Check out this meme!'
    return openShareWindow(getTelegramShareUrl(url, text))
  }, [memeId, title])

  const shareNative = useCallback(async (): Promise<void> => {
    const url = getMemeShareUrl(memeId)
    const text = title ?? 'Check out this meme!'
    await nativeShare(url, imageUrl ?? '', text)
  }, [memeId, title, imageUrl])

  const download = useCallback(async (): Promise<void> => {
    if (!imageUrl) return
    await downloadMemeImage(imageUrl, title ?? 'meme')
  }, [imageUrl, title])

  return {
    copied,
    copyError,
    shareUrl: getMemeShareUrl(memeId),
    canShare: canNativeShare(),
    copyLink,
    shareToWhatsApp,
    shareToFacebook,
    shareToTwitter,
    shareToTelegram,
    shareNative,
    download,
  }
}
