import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import EditProfileModal from '../components/EditProfileModal'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { ROUTES } from '../lib/constants'
import type { Meme, Profile } from '../lib/types'

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

function formatJoinedDate(value: string): string {
  const date = new Date(value)

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function getMostUsedLanguage(memes: Meme[]): string {
  if (memes.length === 0) return 'N/A'

  const counts = memes.reduce<Record<string, number>>((currentCounts, meme) => {
    return {
      ...currentCounts,
      [meme.language]: (currentCounts[meme.language] ?? 0) + 1,
    }
  }, {})

  const [language] = Object.entries(counts).sort((first, second) => {
    return second[1] - first[1]
  })[0]

  return LANGUAGE_LABELS[language] ?? language.toUpperCase()
}

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4 16 6h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1.5-2h5Z" />
      <path d="M12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function Avatar({
  profile,
  isOwnProfile,
  onEditProfile,
}: {
  profile: Profile
  isOwnProfile: boolean
  onEditProfile: () => void
}) {
  return (
    <div className="group relative h-20 w-20 shrink-0">
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#7c3aed] text-[32px] font-medium text-white">
          {getInitials(profile.username)}
        </div>
      )}

      {isOwnProfile ? (
        <>
          <button
            type="button"
            aria-label="Upload avatar"
            onClick={onEditProfile}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-[120ms] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:opacity-100"
          >
            <CameraIcon />
          </button>
        </>
      ) : null}
    </div>
  )
}

function ProfileHeader({
  profile,
  memes,
  isOwnProfile,
  onEditProfile,
}: {
  profile: Profile
  memes: Meme[]
  isOwnProfile: boolean
  onEditProfile: () => void
}) {
  return (
    <header className="border-b border-[#2a2a2a] bg-[#111111] px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar
          profile={profile}
          isOwnProfile={isOwnProfile}
          onEditProfile={onEditProfile}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold leading-[1.4] text-[#ededed]">
                {profile.username}
              </h1>
              <p className="mt-1 text-sm leading-[1.5] text-[#a1a1a1]">
                {memes.length} {memes.length === 1 ? 'meme' : 'memes'}
              </p>
              <p className="mt-1 text-[13px] leading-[1.5] text-[#555555]">
                Joined {formatJoinedDate(profile.created_at)}
              </p>
            </div>

            {isOwnProfile ? (
              <button
                type="button"
                onClick={onEditProfile}
                className="inline-flex h-8 items-center justify-center rounded-[6px] border border-[#2a2a2a] bg-transparent px-4 text-sm font-medium text-[#ededed] transition-colors duration-[120ms] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Edit profile
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

function StatsRow({
  profile,
  memes,
}: {
  profile: Profile
  memes: Meme[]
}) {
  const stats = [
    {
      value: String(memes.length),
      label: 'Total memes',
    },
    {
      value: getMostUsedLanguage(memes),
      label: 'Most used language',
    },
    {
      value: formatJoinedDate(profile.created_at),
      label: 'Joined date',
    },
  ]

  return (
    <section className="border-b border-[#2a2a2a] bg-[#0a0a0a] px-6 py-6">
      <div className="mx-auto grid max-w-3xl grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={[
              'px-3 text-center',
              index > 0 ? 'border-l border-[#2a2a2a]' : '',
            ].join(' ')}
          >
            <p className="truncate text-xl font-semibold leading-[1.4] text-[#7c3aed]">
              {stat.value}
            </p>
            <p className="mt-1 text-xs leading-[1.4] text-[#555555]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function LoadingState() {
  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#0a0a0a] text-[#ededed]">
      <section className="border-b border-[#2a2a2a] bg-[#111111] px-6 py-8">
        <div className="mx-auto flex max-w-5xl animate-pulse flex-col items-center gap-6 sm:flex-row">
          <div className="h-20 w-20 rounded-full bg-[#1a1a1a]" />
          <div className="w-full max-w-xs space-y-3">
            <div className="h-5 w-40 rounded-[6px] bg-[#1a1a1a]" />
            <div className="h-4 w-24 rounded-[6px] bg-[#1a1a1a]" />
            <div className="h-4 w-32 rounded-[6px] bg-[#1a1a1a]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mx-auto mb-6 h-6 w-24 animate-pulse rounded-[6px] bg-[#1a1a1a]" />
        <div className="rounded-[10px] border border-[#2a2a2a] bg-[#111111] p-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse rounded-[8px] bg-[#1a1a1a]"
            />
          ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-[#0a0a0a] px-6 text-center">
      <section>
        <p className="text-base leading-[1.6] text-[#ef4444]">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex h-9 items-center justify-center rounded-[6px] border border-[#2a2a2a] bg-transparent px-4 text-sm font-medium text-[#ededed] transition-colors duration-[120ms] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
        >
          Try again
        </button>
      </section>
    </main>
  )
}

function EmptyState({
  username,
  isOwnProfile,
}: {
  username: string
  isOwnProfile: boolean
}) {
  return (
    <section className="flex min-h-64 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-5xl" aria-hidden="true">
        🎭
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-[1.4] text-[#ededed]">
        No memes yet
      </h2>
      {isOwnProfile ? (
        <Link
          to={ROUTES.CREATE}
          className="mt-6 inline-flex h-9 items-center justify-center rounded-[6px] bg-[#7c3aed] px-4 text-sm font-medium text-white transition-colors duration-[120ms] hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#6d28d9]"
        >
          Create your first meme
        </Link>
      ) : (
        <p className="mt-2 text-base leading-[1.6] text-[#a1a1a1]">
          {username} hasn&apos;t posted yet
        </p>
      )}
    </section>
  )
}

function MemeTile({
  meme,
  isOwnProfile,
  onRequestDelete,
}: {
  meme: Meme
  isOwnProfile: boolean
  onRequestDelete: (memeId: string) => void
}) {
  return (
    <article className="group relative aspect-square overflow-hidden rounded-[8px] bg-[#111111] transition-transform duration-[120ms] hover:scale-[0.99]">
      <img
        src={meme.image_url}
        alt={meme.title ?? 'Profile meme'}
        className="h-full w-full object-cover transition-opacity duration-[120ms] group-hover:opacity-90"
        loading="lazy"
      />

      {isOwnProfile ? (
        <button
          type="button"
          aria-label="Delete meme"
          onClick={() => onRequestDelete(meme.id)}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-[6px] bg-black/60 text-white opacity-0 transition-colors duration-[120ms] hover:bg-[#1a1a1a] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a] group-hover:opacity-100"
        >
          <TrashIcon />
        </button>
      ) : null}
    </article>
  )
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const resolvedUserId = username ? '' : user?.id ?? ''
  const { profile, memes, loading, error, isOwnProfile, deleteMeme, refresh } =
    useProfile(resolvedUserId, username)

  const displayedProfile = profile

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return

    void deleteMeme(deleteTargetId).then(() => {
      setDeleteTargetId(null)
    })
  }

  const handleProfileSave = () => {
    setEditOpen(false)
    refresh()
  }

  if (loading) {
    return <LoadingState />
  }

  if (error || !displayedProfile) {
    return (
      <ErrorState
        message={error ?? 'Profile not found'}
        onRetry={refresh}
      />
    )
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-[#0a0a0a] text-[#ededed]">
      <ProfileHeader
        profile={displayedProfile}
        memes={memes}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => setEditOpen(true)}
      />

      <StatsRow profile={displayedProfile} memes={memes} />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-semibold leading-[1.4] text-[#ededed]">
          Memes
        </h2>

        {memes.length > 0 ? (
          <div className="rounded-[10px] border border-[#2a2a2a] bg-[#111111] p-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {memes.map((meme) => (
                <MemeTile
                  key={meme.id}
                  meme={meme}
                  isOwnProfile={isOwnProfile}
                  onRequestDelete={setDeleteTargetId}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            username={displayedProfile.username}
            isOwnProfile={isOwnProfile}
          />
        )}
      </section>

      {editOpen ? (
        <EditProfileModal
          profile={displayedProfile}
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={handleProfileSave}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  )
}
