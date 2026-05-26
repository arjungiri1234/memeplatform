import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../lib/constants'
import { useAuth } from '../hooks/useAuth'
import Button from './ui/Button'

const NAV_LINKS = [
  { href: ROUTES.FEED, labelKey: 'nav.feed' },
  { href: ROUTES.CREATE, labelKey: 'nav.create' },
] as const

function getInitials(username: string | null | undefined): string {
  if (!username) {
    return 'U'
  }

  return username.slice(0, 2).toUpperCase()
}

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { profile, loading, isAuthenticated, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const username = profile?.username ?? 'User'
  const initials = getInitials(profile?.username)

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  async function handleSignOut() {
    setIsMenuOpen(false)
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 h-20 border-b-2 border-[#2a2633] bg-[#0f0f0f]/90 backdrop-blur-[12px]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 md:px-16">
        <Link
          to={ROUTES.HOME}
          className="group flex items-center gap-2 rounded-btn px-2 py-1 outline-none transition-transform duration-[120ms] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#d0bcff]"
        >
          <span className="text-2xl leading-none text-[#ff7a2f] transition-transform duration-[120ms] group-hover:rotate-12 group-hover:scale-110">
            ^
          </span>
          <span className="font-display text-2xl font-bold tracking-normal text-[#d0bcff] transition-colors duration-[120ms] group-hover:text-[#e9ddff]">
            memeit
          </span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, labelKey }) => {
            const isActive = pathname === href

            return (
              <Link
                key={href}
                to={href}
                className={[
                  'rounded-btn px-3 py-2 font-display text-base font-bold transition-all duration-[120ms]',
                  'outline-none focus-visible:ring-2 focus-visible:ring-[#d0bcff]',
                  isActive
                    ? 'bg-[#201f1f] text-[#d0bcff] ring-1 ring-[#494454]'
                    : 'text-[#cbc3d7] hover:-translate-y-0.5 hover:bg-[#201f1f] hover:text-[#e9ddff]',
                ].join(' ')}
              >
                {t(labelKey)}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-[#201f1f]" />
          ) : isAuthenticated ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-btn px-1 py-1 text-[#e9ddff] outline-none transition-colors hover:bg-[#201f1f] focus-visible:ring-2 focus-visible:ring-[#d0bcff]"
                aria-expanded={isMenuOpen}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d0bcff] text-sm font-bold text-[#23005c]">
                    {initials}
                  </span>
                )}
                <span className="hidden max-w-32 truncate text-sm font-bold md:inline">
                  {username}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-btn border border-[#494454] bg-[#151418] shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      navigate(ROUTES.PROFILE)
                    }}
                    className="block w-full px-4 py-2 text-left text-sm font-medium text-[#e9ddff] hover:bg-[#201f1f]"
                  >
                    Profile
                  </button>
                  <div className="h-px bg-[#494454]" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm font-medium text-danger hover:bg-[#201f1f]"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="hidden h-9 items-center rounded-btn border border-[#494454] bg-transparent px-4 text-sm font-bold text-[#cbc3d7] transition-all duration-[120ms] hover:-translate-y-0.5 hover:border-[#d0bcff] hover:bg-[#201f1f] hover:text-[#e9ddff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0bcff] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link to={ROUTES.LOGIN} className="inline-flex">
                <Button
                  variant="primary"
                  size="md"
                  className="border border-[#d0bcff] bg-[#d0bcff] px-5 font-bold text-[#23005c] shadow-none transition-all duration-[120ms] hover:-translate-y-0.5 hover:bg-[#e9ddff] hover:ring-2 hover:ring-[#d0bcff]/30 active:translate-y-0"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
