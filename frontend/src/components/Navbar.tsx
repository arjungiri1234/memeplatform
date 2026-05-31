import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { getLoginRoute, ROUTES } from '../lib/constants'
import { useAuth } from '../hooks/useAuth'

const NAV_LINKS = [
  { href: ROUTES.FEED, labelKey: 'nav.feed', requiresAuth: true },
  { href: ROUTES.CREATE, labelKey: 'nav.create', requiresAuth: true },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const shouldReduceMotion = useReducedMotion() ?? false

  useEffect(() => {
    document.body.style.removeProperty('overflow')
    document.documentElement.style.removeProperty('overflow')
  }, [])

  useEffect(() => {
    if (shouldReduceMotion) return
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [shouldReduceMotion])
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

  useEffect(() => {
    if (!mobileMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

  async function handleSignOut() {
    setIsMenuOpen(false)
    await signOut()
  }

  return (
    <>
    <motion.header
      className={`sticky top-0 z-50 h-16 border-b pt-[env(safe-area-inset-top)] ${scrolled ? 'backdrop-blur-[12px]' : ''}`}
      animate={shouldReduceMotion
        ? { backgroundColor: '#0a0a0a', borderBottomColor: '#1e1e1e' }
        : {
            backgroundColor: scrolled ? '#0a0a0a' : 'rgba(10,10,10,0)',
            borderBottomColor: scrolled ? '#1e1e1e' : 'rgba(30,30,30,0)',
          }
      }
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="relative flex h-full w-full items-center justify-between px-5 md:px-10">
        <Link
          to={ROUTES.HOME}
          aria-label="memeit home"
          className="group flex items-center rounded-btn outline-none transition-opacity duration-[120ms] hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#00e676]"
        >
          <img
            src="/memeit-logo.png"
            alt="memeit"
            className="h-16 w-auto object-contain"
          />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex" aria-label="Main navigation">
          {NAV_LINKS.filter((link) => !link.requiresAuth || isAuthenticated).map(({ href, labelKey }) => {
            const isActive = pathname === href

            return (
              <Link
                key={href}
                to={href}
                className={[
                  'inline-flex h-10 items-center rounded-btn border px-5 text-[13px] font-semibold transition-all duration-[120ms]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676]',
                  isActive
                    ? 'border-[#00e676]/40 bg-[#00e676]/10 text-[#00e676]'
                    : 'border-[#2a2a2a] bg-transparent text-[#a1a1a1] hover:border-[#00e676]/60 hover:bg-[#00e676]/10 hover:text-[#00e676]',
                ].join(' ')}
              >
                {t(labelKey)}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
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
                className="hidden h-10 items-center rounded-btn border border-[#2a2a2a] bg-transparent px-5 text-[13px] font-semibold text-[#a1a1a1] transition-all duration-[120ms] hover:border-[#00e676]/60 hover:bg-[#00e676]/10 hover:text-[#00e676] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] active:bg-[#00e676]/15 md:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to={getLoginRoute({ mode: 'signup', redirectTo: ROUTES.CREATE })}
                className="hidden h-10 items-center rounded-btn border border-[#00e676] bg-[#00c96b] px-5 text-[13px] font-semibold text-[#052e1a] transition-all duration-[120ms] hover:-translate-y-0.5 hover:bg-[#00e676] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] active:translate-y-0 active:bg-[#00b85f] md:inline-flex"
              >
                Get Started
              </Link>
            </>
          )}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-btn text-xl text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] md:hidden"
          >
            ☰
          </button>
        </div>
      </div>
    </motion.header>

    {mobileMenuOpen ? (
      <div
        className="fixed inset-0 z-[60] bg-black/60 md:hidden"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setMobileMenuOpen(false)
          }
        }}
      >
        <motion.aside
          aria-label="Mobile navigation"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="ml-auto flex h-full w-[280px] flex-col border-l border-[#2a2a2a] bg-[#111111] p-4"
        >
          <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
            <span className="font-display text-base font-semibold text-[#ededed]">
              Menu
            </span>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-btn text-xl text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676]"
            >
              ×
            </button>
          </div>

          <nav className="flex flex-col gap-1 py-4" aria-label="Mobile navigation links">
            <Link
              to={ROUTES.CREATE}
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center rounded-btn px-3 text-sm font-medium text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#00e676]/10 hover:text-[#00e676] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676]"
            >
              Create
            </Link>

            {!isAuthenticated ? (
              <>
                <div className="my-3 h-px bg-[#2a2a2a]" />
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-btn px-3 text-sm font-medium text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#00e676]/10 hover:text-[#00e676] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676]"
                >
                  Sign in
                </Link>
                <Link
                  to={getLoginRoute({ mode: 'signup', redirectTo: ROUTES.CREATE })}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 flex min-h-11 items-center justify-center rounded-btn border border-[#00e676] bg-[#00c96b] px-4 text-sm font-semibold text-[#052e1a] transition-all duration-[120ms] hover:-translate-y-0.5 hover:bg-[#00e676] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] active:translate-y-0 active:bg-[#00b85f]"
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </nav>
        </motion.aside>
      </div>
    ) : null}
    </>
  )
}
