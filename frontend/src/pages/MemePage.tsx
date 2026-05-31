import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MemeCard, { MemeCardSkeleton } from '../components/MemeCard'
import { getMemeById } from '../lib/supabaseClient'
import { ROUTES } from '../lib/constants'
import type { MemeWithProfile } from '../lib/types'

export default function MemePage() {
  const { memeId } = useParams<{ memeId: string }>()
  const [meme, setMeme] = useState<MemeWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!memeId) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let cancelled = false

    getMemeById(memeId).then((data) => {
      if (cancelled) return
      if (!data) {
        setNotFound(true)
      } else {
        setMeme(data)
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [memeId])

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#0a0a0a] px-4 py-10 text-[#ededed]">
      <div className="mx-auto w-full max-w-[600px]">
        {loading ? (
          <MemeCardSkeleton />
        ) : notFound || !meme ? (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <p className="text-[15px] font-medium text-[#a1a1a1]">
              Meme not found.
            </p>
            <Link
              to={ROUTES.FEED}
              className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#2a2a2a] bg-transparent px-5 text-[13px] font-medium text-[#ededed] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
            >
              Back to feed
            </Link>
          </div>
        ) : (
          <MemeCard
            id={meme.id}
            imageUrl={meme.image_url}
            title={meme.title}
            language={meme.language}
            viewCount={meme.view_count}
            createdAt={meme.created_at}
            profile={{
              username: meme.profiles.username,
              avatarUrl: meme.profiles.avatar_url,
            }}
          />
        )}
      </div>
    </main>
  )
}
