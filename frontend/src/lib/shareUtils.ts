export function getMemeShareUrl(memeId: string): string {
  const configuredOrigin = import.meta.env.VITE_PUBLIC_APP_URL?.trim()
  const origin = configuredOrigin || window.location.origin

  return `${origin.replace(/\/$/, '')}/meme/${memeId}`
}

export function getWhatsAppShareUrl(memeUrl: string, title: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title} ${memeUrl}`)}`
}

export function getFacebookShareUrl(memeUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(memeUrl)}`
}

export function getTwitterShareUrl(memeUrl: string, title: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(memeUrl)}`
}

export function getTelegramShareUrl(memeUrl: string, title: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(memeUrl)}&text=${encodeURIComponent(title)}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for browsers without Clipboard API
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch {
      return false
    }
  }
}

export function openShareWindow(url: string): boolean {
  const shareWindow = window.open(url, '_blank')

  if (!shareWindow) {
    return false
  }

  shareWindow.opener = null
  return true
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function nativeShare(
  memeUrl: string,
  imageUrl: string,
  title: string,
): Promise<boolean> {
  if (!canNativeShare()) return false

  try {
    // Try to share the actual image file (supported on mobile)
    if (typeof navigator.canShare === 'function') {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'meme.jpg', { type: blob.type || 'image/jpeg' })

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title, url: memeUrl, files: [file] })
        return true
      }
    }

    // Fallback: share URL only
    await navigator.share({ title, url: memeUrl })
    return true
  } catch (error) {
    // User cancelled share — not an error
    if (error instanceof DOMException && error.name === 'AbortError') return false
    return false
  }
}

export async function downloadMemeImage(
  imageUrl: string,
  title: string,
): Promise<boolean> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = `${title.trim() || 'meme'}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
    return true
  } catch {
    return false
  }
}
