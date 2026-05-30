import { useState } from 'react'

export interface MemeCardProps {
  id: string
  imageUrl: string
  title: string | null
  language: string
  viewCount: number
  createdAt: string
  canDelete?: boolean
  deleting?: boolean
  onDelete?: (id: string) => void
  profile: {
    username: string
    avatarUrl: string | null
  }
}

const LANGUAGE_BADGE_COLORS: Record<string, string> = {
  en: '#8b5cf6',
  ne: '#f43f5e',
  hi: '#f59e0b',
  ru: '#06b6d4',
  zh: '#ef4444',
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'EN',
  ne: 'NE',
  hi: 'HI',
  ru: 'RU',
  zh: 'ZH',
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

function getRelativeTime(value: string): string {
  const createdAt = new Date(value).getTime()
  const diffMs = Date.now() - createdAt
  const minutes = Math.max(1, Math.floor(diffMs / 60000))

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)

  if (days < 30) {
    return `${days}d ago`
  }

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function ShareButton() {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-3 py-2 text-[13px] font-medium text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
    >
      <span aria-hidden="true">↗</span>
      <span>Share</span>
    </button>
  )
}

export function MemeCardSkeleton() {
  return (
    <article className="animate-pulse overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#111111]">
      <div className="flex items-center gap-3 p-4">
        <div className="h-8 w-8 rounded-full bg-[#1a1a1a]" />
        <div className="h-4 w-36 rounded-full bg-[#1a1a1a]" />
        <div className="ml-auto h-6 w-14 rounded-full bg-[#1a1a1a]" />
      </div>
      <div className="mx-4 aspect-[4/3] rounded-[8px] bg-[#1a1a1a]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 rounded-full bg-[#1a1a1a]" />
        <div className="h-4 w-1/2 rounded-full bg-[#1a1a1a]" />
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-[#2a2a2a] p-3">
        <div className="h-9 rounded-[6px] bg-[#1a1a1a]" />
        <div className="h-9 rounded-[6px] bg-[#1a1a1a]" />
        <div className="h-9 rounded-[6px] bg-[#1a1a1a]" />
      </div>
    </article>
  )
}

export default function MemeCard({
  id,
  imageUrl,
  title,
  language,
  createdAt,
  canDelete = false,
  deleting = false,
  onDelete,
  profile,
}: MemeCardProps) {
  const [optionsOpen, setOptionsOpen] = useState(false)
  const badgeColor = LANGUAGE_BADGE_COLORS[language] ?? LANGUAGE_BADGE_COLORS.en
  const languageLabel = LANGUAGE_LABELS[language] ?? language.toUpperCase()

  const handleDelete = () => {
    setOptionsOpen(false)
    onDelete?.(id)
  }

  return (
    <article className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#111111] transition-colors duration-[120ms] hover:border-[#3a3a3a]">
      <header className="flex items-center gap-3 p-4">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c3aed] text-[13px] font-medium text-white">
            {getInitials(profile.username)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-[#ededed]">
            {profile.username}
            <span className="px-1 text-[#555555]">·</span>
            <span className="font-normal text-[#a1a1a1]">
              {getRelativeTime(createdAt)}
            </span>
          </p>
        </div>

        <span
          className="rounded-full px-2 py-1 text-[11px] font-medium text-white"
          style={{ backgroundColor: badgeColor }}
        >
          {languageLabel}
        </span>

        {canDelete ? (
          <div className="relative">
            <button
              type="button"
              aria-label="Open meme options"
              aria-expanded={optionsOpen}
              onClick={() => setOptionsOpen((isOpen) => !isOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
            >
              ...
            </button>

            {optionsOpen ? (
              <div className="absolute right-0 top-10 z-20 w-48 rounded-[10px] border border-[#2a2a2a] bg-[#111111] p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex h-10 w-full items-center rounded-[6px] px-3 text-left text-sm font-medium leading-[1.5] text-[#ef4444] transition-colors duration-[120ms] hover:bg-[#ef4444]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] active:bg-[#ef4444]/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Delete meme'}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="bg-[#1a1a1a] px-4">
        <img
          src={imageUrl}
          alt={title ?? `Meme by ${profile.username}`}
          loading="lazy"
          className="max-h-[600px] w-full rounded-[8px] bg-[#1a1a1a] object-cover"
        />
      </div>

      {title ? (
        <p className="px-4 py-3 text-[15px] font-medium leading-[1.6] text-[#ededed]">
          {title}
        </p>
      ) : null}

      <footer className="flex justify-end border-t border-[#2a2a2a] p-3">
        <ShareButton />
      </footer>
    </article>
  )
}
