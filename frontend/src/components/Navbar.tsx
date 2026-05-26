import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '../lib/constants'
import Button from './ui/Button'

const NAV_LINKS = [
  { href: ROUTES.HOME, labelKey: 'nav.feed' },
  { href: ROUTES.CREATE, labelKey: 'nav.create' },
] as const

export default function Navbar() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-50 h-20 border-b-2 border-[#2a2633] bg-[#0f0f0f]/90 backdrop-blur-[12px]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 md:px-16">
        <Link
          to={ROUTES.HOME}
          className="group flex items-center gap-2 rounded-btn px-2 py-1 outline-none transition-transform duration-[120ms] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#d0bcff]"
        >
          <span className="text-2xl leading-none text-[#ff7a2f] transition-transform duration-[120ms] group-hover:rotate-12 group-hover:scale-110">
            ▴
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
          <Link
            to={ROUTES.LOGIN}
            className="hidden h-9 items-center rounded-btn border border-[#494454] bg-transparent px-4 text-sm font-bold text-[#cbc3d7] transition-all duration-[120ms] hover:-translate-y-0.5 hover:border-[#d0bcff] hover:bg-[#201f1f] hover:text-[#e9ddff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0bcff] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link to={ROUTES.CREATE} className="inline-flex">
            <Button
              variant="primary"
              size="md"
              className="border border-[#d0bcff] bg-[#d0bcff] px-5 font-bold text-[#23005c] shadow-none transition-all duration-[120ms] hover:-translate-y-0.5 hover:bg-[#e9ddff] hover:ring-2 hover:ring-[#d0bcff]/30 active:translate-y-0"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
