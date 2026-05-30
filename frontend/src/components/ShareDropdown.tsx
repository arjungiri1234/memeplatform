import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useShare } from '../hooks/useShare'

interface ShareDropdownProps {
  memeId: string
  title: string | null
  imageUrl: string
  isOpen: boolean
  onClose: () => void
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="#25D366">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.557 4.126 1.531 5.856L.04 23.18a.6.6 0 0 0 .734.76l5.492-1.436A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.95 9.95 0 0 1-5.12-1.41l-.366-.216-3.795.993 1.02-3.712-.24-.382A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm5.47-7.618c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.164-.173.199-.347.224-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.457.13-.606.134-.133.298-.347.446-.52.149-.173.198-.297.298-.496.099-.199.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.58-.487-.5-.669-.51a12.1 12.1 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.298-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.57-.085 1.757-.719 2.005-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="#ededed">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="#229ED9">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.19 14.447l-2.938-.916c-.637-.2-.65-.637.136-.943l11.47-4.42c.532-.194.998.13.704.08z" />
    </svg>
  )
}

const ROW_CLASS =
  'flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[6px] px-2 text-[13px] font-medium text-[#ededed] transition-colors duration-[150ms] hover:bg-[#2a2a2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]'

function DownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" />
      <path d="m7 10 5 5 5-5" />
      <path d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5" />
    </svg>
  )
}

function NativeShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

export default function ShareDropdown({ memeId, title, imageUrl, isOpen, onClose }: ShareDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { copied, copyLink, shareToWhatsApp, shareToFacebook, shareToTwitter, shareToTelegram, shareNative, download, canShare } =
    useShare({ memeId, title, imageUrl })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  function handleSocial(fn: () => boolean) {
    if (!fn()) {
      toast.error('Your browser blocked the share tab. Allow pop-ups and try again.')
      return
    }

    setTimeout(onClose, 300)
  }

  if (!isOpen) {
    return null
  }

  return (
    <motion.div
      ref={containerRef}
      role="menu"
      aria-label="Share options"
      initial={{ opacity: 0, scale: 0.97, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute bottom-[calc(100%+8px)] right-0 z-50 w-[200px] rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
          {/* Copy link */}
          <button type="button" role="menuitem" onClick={copyLink} className={ROW_CLASS}>
            <LinkIcon />
            {copied
              ? <span className="text-[#22c55e]">Copied! ✓</span>
              : <span>Copy link</span>
            }
          </button>

          {/* WhatsApp */}
          <button type="button" role="menuitem" onClick={() => handleSocial(shareToWhatsApp)} className={ROW_CLASS}>
            <WhatsAppIcon />
            <span>WhatsApp</span>
          </button>

          {/* Facebook */}
          <button type="button" role="menuitem" onClick={() => handleSocial(shareToFacebook)} className={ROW_CLASS}>
            <FacebookIcon />
            <span>Facebook</span>
          </button>

          {/* Twitter / X */}
          <button type="button" role="menuitem" onClick={() => handleSocial(shareToTwitter)} className={ROW_CLASS}>
            <TwitterIcon />
            <span>Twitter / X</span>
          </button>

          {/* Telegram */}
          <button type="button" role="menuitem" onClick={() => handleSocial(shareToTelegram)} className={ROW_CLASS}>
            <TelegramIcon />
            <span>Telegram</span>
          </button>

          <div className="my-1 h-px bg-[#2a2a2a]" />

          {/* Native share — only shown when Web Share API is available (mobile) */}
          {canShare && (
            <button type="button" role="menuitem" onClick={() => { void shareNative(); setTimeout(onClose, 300) }} className={ROW_CLASS}>
              <NativeShareIcon />
              <span>Share via device</span>
            </button>
          )}

          {/* Download */}
          <button type="button" role="menuitem" onClick={() => { void download(); setTimeout(onClose, 300) }} className={ROW_CLASS}>
            <DownloadIcon />
            <span>Download image</span>
          </button>
    </motion.div>
  )
}
