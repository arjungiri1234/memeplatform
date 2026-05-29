import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useState } from 'react'
import MemeCard, { MemeCardSkeleton } from '../components/MemeCard'
import { useAuth } from '../hooks/useAuth'
import { useFeed } from '../hooks/useFeed'
import { ROUTES } from '../lib/constants'

const LANGUAGE_CARDS = [
  {
    code: 'NP',
    name: 'Nepali',
    caption: 'जनता जान्न चाहन्छन्',
    border: '#d0bcff',
    tint: '#0f3b33',
    imageSrc: '/memes/rishi.png',
    imageAlt: 'Nepali meme showcase image',
  },
  {
    code: 'IN',
    name: 'Hindi',
    caption: 'please sir.',
    border: '#ffb2b7',
    tint: '#3b2418',
    imageSrc: '/memes/xavier.png',
    imageAlt: 'Xavier meme showcase image',
  },
  {
    code: 'RU',
    name: 'Russian',
    caption: 'Это не я',
    border: '#f9bd22',
    tint: '#1d263a',
    imageSrc: '/memes/russia.png',
    imageAlt: 'Russian meme showcase image',
  },
  {
    code: 'CN',
    name: 'Chinese',
    caption: '不是我啊',
    border: '#e5e2e1',
    tint: '#3a2019',
    imageSrc: '/memes/chinese.png',
    imageAlt: 'Chinese meme showcase image',
  },
  {
    code: 'US',
    name: 'English',
    caption: 'what?',
    border: '#a078ff',
    tint: '#291746',
    imageSrc: '/memes/US.png',
    imageAlt: 'English meme showcase image',
  },
] as const

const MARQUEE_ITEMS = [
  { src: '/memes/zomato.png', alt: 'Community meme', rot: 'rotate-3' },
  { src: '/memes/chasma.png', alt: 'Community meme', rot: '-rotate-6' },
  { src: '/memes/akshay.png', alt: 'Community meme', rot: 'rotate-12' },
  { src: '/memes/kp.png', alt: 'Community meme', rot: '-rotate-3' },
  { src: '/memes/idhar.png', alt: 'Community meme', rot: 'rotate-6' },
  { src: '/memes/titanic.png', alt: 'Community meme', rot: '-rotate-6' },
  { src: '/memes/tony.png', alt: 'Community meme', rot: 'rotate-3' },
  { src: '/memes/crying.png', alt: 'Community meme', rot: '-rotate-6' },
] as const

const HERO_LANGUAGE_CHIPS = [
  { label: '[नेपाली]', color: '#ffb2b7' },
  { label: '[हिन्दी]', color: '#d0bcff' },
  { label: '[Español]', color: '#f9bd22' },
  { label: '[中文]', color: '#e5e2e1' },
] as const

const STEPS = [
  {
    title: '1. Pick a Template',
    body: 'Upload your own or pick from thousands of trends.',
    color: '#ffb2b7',
    shadow: '#d0bcff',
    icon: (
      <path d="M8 3h6l4 4v14H8V3Zm6 0v5h5M11 15h4M13 13v4" />
    ),
  },
  {
    title: '2. Add Multilingual Context',
    body: 'Type in any language. AI handles the slang.',
    color: '#d0bcff',
    shadow: '#ffb2b7',
    icon: (
      <path d="M4 5h9M8.5 5c0 4-1.5 7-4.5 9M6.5 9c1 2 2.5 3.7 5 5M15 12l5 9M16 18h3M17.5 12 13 21" />
    ),
  },
  {
    title: '3. Go Viral',
    body: 'Publish to the feed and share across the globe.',
    color: '#f9bd22',
    shadow: '#d0bcff',
    icon: (
      <path d="M12 3c3.5 1.2 6 3.8 7 7.5l-4.5 4.5-5.5 1-1-5.5L12 3Zm-3.5 9.5-4 4M12 16l-1.5 4.5M8 12 3.5 13.5M15 8.5h.01" />
    ),
  },
] as const

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

function PortraitPlaceholder({
  tint,
  label,
  imageSrc,
  imageAlt,
  imageFit = 'cover',
}: {
  tint: string
  label: string
  imageSrc?: string
  imageAlt?: string
  imageFit?: 'cover' | 'contain'
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-lg border border-[#494454]"
      style={{ backgroundColor: tint }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt ?? ''}
          className={[
            'absolute inset-0 h-full w-full object-center',
            imageFit === 'contain' ? 'object-contain' : 'object-cover',
          ].join(' ')}
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : null}
      {!imageSrc ? (
        <>
          <div className="absolute left-1/2 top-7 h-16 w-16 -translate-x-1/2 rounded-full border-2 border-[#e5e2e1]/30 bg-[#e5e2e1]/20" />
          <div className="absolute bottom-4 left-1/2 h-20 w-28 -translate-x-1/2 rounded-t-full border-2 border-[#e5e2e1]/20 bg-black/35" />
          {label ? (
            <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-center font-meme text-sm tracking-wide text-white">
              {label}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function HeroMemeCard({
  className,
  caption,
  tint,
  border,
  shadow,
  imageSrc,
  imageAlt,
  captionBg = '#ffffff',
  captionColor = '#000000',
}: {
  className: string
  caption: string
  tint: string
  border: string
  shadow: string
  imageSrc?: string
  imageAlt?: string
  captionBg?: string
  captionColor?: string
}) {
  return (
    <div
      className={[
        'absolute w-56 rounded-xl bg-[#201f1f] p-2 transition-transform duration-300 hover:rotate-0 sm:w-72',
        className,
      ].join(' ')}
      style={{ border: `2px solid ${border}`, boxShadow: `4px 4px 0 ${shadow}` }}
    >
      <div className="aspect-[16/9]">
        <PortraitPlaceholder
          tint={tint}
          label=""
          imageSrc={imageSrc}
          imageAlt={imageAlt}
        />
      </div>
      <p
        className="mt-2 rounded-md border border-black/20 px-2 py-2 text-center font-meme text-2xl uppercase leading-none shadow-[2px_2px_0_rgba(0,0,0,0.45)]"
        style={{ backgroundColor: captionBg, color: captionColor }}
      >
        {caption}
      </p>
    </div>
  )
}

function LanguageCard({ card }: { card: (typeof LANGUAGE_CARDS)[number] }) {
  return (
    <article
      className="group rounded-xl bg-[#201f1f] p-5 transition-transform duration-300 hover:-translate-y-4"
      style={{ border: `2px solid ${card.border}` }}
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="font-display text-xl font-bold text-white">{card.code}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#cbc3d7]/60">
          {card.name}
        </span>
      </div>
      <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-black/30">
        <PortraitPlaceholder
          tint={card.tint}
          label=""
          imageSrc={card.imageSrc}
          imageAlt={card.imageAlt}
          imageFit="contain"
        />
      </div>
      <p className="font-meme text-lg uppercase leading-none text-white transition-colors duration-200 group-hover:text-[#d0bcff]">
        {card.caption}
      </p>
    </article>
  )
}

function MarqueeTile({ item }: { item: (typeof MARQUEE_ITEMS)[number] }) {
  return (
    <div
      className={`h-32 w-44 shrink-0 overflow-hidden rounded-lg border border-[#494454] bg-[#201f1f] transition-transform duration-300 hover:scale-110 hover:rotate-0 ${item.rot}`}
    >
      <img
        src={item.src}
        alt={item.alt}
        className="h-full w-full object-cover object-center"
      />
    </div>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0f0f0f] text-[#e5e2e1]">
      <style>
        {`
          @media (prefers-reduced-motion: no-preference) {
            .float-card { animation: float-card 4s ease-in-out infinite; }
            .wiggle:hover { animation: wiggle 0.4s ease-in-out infinite; }
            .pulse-pop { animation: pulse-pop 2s ease-in-out infinite; }
            .marquee-track { animation: marquee 30s linear infinite; }
          }

          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          @keyframes float-card {
            0%, 100% { transform: translateY(0) rotate(var(--rot)); }
            50% { transform: translateY(-15px) rotate(var(--rot)); }
          }

          @keyframes wiggle {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }

          @keyframes pulse-pop {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        `}
      </style>

      <section className="relative flex min-h-[calc(100vh-80px)] flex-col items-center gap-12 px-5 pb-16 pt-20 md:flex-row md:px-16">
        <div className="pointer-events-none absolute right-6 top-10 select-none font-meme text-7xl text-white/90 md:text-8xl">
          LMAO
        </div>
        <div className="pointer-events-none absolute bottom-6 left-5 select-none font-meme text-7xl text-white/90 md:text-8xl">
          LOL
        </div>
        <div className="absolute left-[56%] top-28 hidden text-3xl text-[#d0bcff] md:block">✦</div>
        <div className="wiggle absolute right-[12%] top-[34%] hidden text-5xl md:block">🔥</div>
        <div className="wiggle absolute bottom-[22%] left-[58%] hidden text-4xl md:block">😂</div>

        <div className="relative z-10 flex w-full flex-col gap-6 md:w-1/2">
          <div className="inline-flex w-fit items-center rounded-pill border-2 border-[#f9bd22] bg-[#201f1f] px-4 py-1">
            <span className="pulse-pop inline-block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#f9bd22]">
              AI-powered · 5 languages · free
            </span>
          </div>

          <h1 className="font-display text-[42px] font-bold leading-[1.05] tracking-normal text-white md:text-[64px]">
            Make memes
            <br />
            the whole
            <br />
            <span className="text-[#d0bcff]">world gets</span>
            <span className="ml-3 inline-block h-8 w-8 rounded-full bg-[#ffb2b7] align-middle md:h-11 md:w-11" />
          </h1>

          <p className="max-w-md text-base font-medium leading-[1.6] text-[#cbc3d7] md:text-lg">
            Don&apos;t let language stop the vibes. Create viral memes in 5 major
            languages using AI that actually gets the context.
          </p>

          <div className="flex flex-wrap gap-2 py-1">
            {HERO_LANGUAGE_CHIPS.map((chip) => (
              <span
                key={chip.label}
                className="rounded-pill border border-[#494454] bg-[#201f1f] px-3 py-1 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:border-current hover:bg-[#2a2a2a]"
                style={{ color: chip.color }}
              >
                {chip.label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to={ROUTES.CREATE}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#d0bcff] px-8 font-bold text-[#23005c] shadow-[4px_4px_0_#ffb2b7] transition-transform duration-150 hover:scale-110 active:scale-95"
            >
              Create Now
            </Link>
            <Link
              to={ROUTES.HOME}
              className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-[#d0bcff] px-8 font-bold text-[#d0bcff] transition-all duration-150 hover:scale-105 hover:bg-[#d0bcff]/10 active:scale-95"
            >
              Explore Feed
            </Link>
          </div>
        </div>

        <div className="relative z-10 h-[560px] w-full md:w-1/2">
          <HeroMemeCard
            caption="My brain at 3am."
            tint="#172f2b"
            border="#d0bcff"
            shadow="#d0bcff"
            imageSrc="/memes/spanish.png"
            imageAlt="Spanish meme test image"
            captionBg="#d0bcff"
            captionColor="#23005c"
            className="float-card left-0 top-6 rotate-[-8deg] [--rot:-8deg] md:left-4"
          />
          <HeroMemeCard
            caption="Nobody asked this"
            tint="#342222"
            border="#ffb2b7"
            shadow="#ffb2b7"
            imageSrc="/memes/donaldtrump.png"
            imageAlt="Donald Trump meme test image"
            captionBg="#ffb2b7"
            captionColor="#40000d"
            className="float-card right-0 top-24 rotate-[5deg] [--rot:5deg] md:right-2"
          />
          <HeroMemeCard
            caption="होइन होला कि हो?"
            tint="#2f2418"
            border="#f9bd22"
            shadow="#f9bd22"
            imageSrc="/memes/hoinahola.png"
            imageAlt="Nepali meme test image"
            captionBg="#f9bd22"
            captionColor="#261a00"
            className="float-card bottom-4 left-1/2 z-20 -translate-x-1/2 rotate-[-3deg] [--rot:-3deg]"
          />
          <span className="absolute bottom-24 right-2 rotate-12 bg-[#f9bd22] px-4 py-1 font-meme text-xl text-[#402d00]">
            STARK
          </span>
          <span className="absolute left-2 top-60 -rotate-12 bg-[#ffb2b7] px-4 py-1 font-meme text-xl text-[#40000d]">
            LMAO
          </span>
        </div>
      </section>

      <section className="bg-[#0e0e0e] px-5 py-24 md:px-16">
        <h2 className="mb-16 text-center font-display text-2xl font-bold text-white">
          How it Works
        </h2>
        <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-between gap-12 md:flex-row">
          <div className="absolute left-1/2 top-10 hidden h-0 w-1/2 -translate-x-1/2 border-t-4 border-dotted border-[#494454] md:block" />
          {STEPS.map((step) => (
            <div key={step.title} className="relative z-10 flex max-w-[220px] flex-col items-center gap-4 text-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-xl border-2 text-[#23005c] transition-transform duration-200 hover:-rotate-3 hover:scale-110"
                style={{
                  backgroundColor: step.color,
                  borderColor: '#23005c',
                  boxShadow: `4px 4px 0 ${step.shadow}`,
                }}
              >
                <Icon>{step.icon}</Icon>
              </div>
              <h3 className="font-display text-lg font-bold" style={{ color: step.color }}>
                {step.title}
              </h3>
              <p className="text-sm leading-[1.5] text-[#cbc3d7]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-24 md:px-16">
        <div className="mb-16 flex flex-col items-center">
          <h2 className="text-center font-display text-3xl font-bold text-white">
            Humor has no language barrier
          </h2>
          <div className="pulse-pop mt-3 h-1.5 w-40 rounded-full bg-[#d0bcff]" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {LANGUAGE_CARDS.map((card) => (
            <LanguageCard key={card.code} card={card} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden border-y-2 border-[#2a2633] bg-[#1c1b1b] py-12">
        <p className="mb-8 text-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#cbc3d7]">
          Fresh from the community
        </p>
        <div className="marquee-track flex w-max gap-6 px-4">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <MarqueeTile key={`${item.src}-${index}`} item={item} />
          ))}
        </div>
      </section>

      <section className="px-5 py-24 md:px-16">
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 overflow-hidden rounded-[40px] border-2 border-[#d0bcff] bg-[linear-gradient(110deg,#a078ff,#b50036,#b88900)] p-12 text-center shadow-[4px_4px_0_#d0bcff] md:p-24">
          <span className="wiggle absolute left-8 top-8 text-3xl">🎉</span>
          <span className="wiggle absolute bottom-8 right-8 text-3xl">✨</span>
          <h2 className="font-display text-4xl font-bold leading-[1.05] text-white md:text-6xl">
            Your meme is waiting
          </h2>
          <p className="max-w-lg text-base font-bold leading-[1.6] text-white/90">
            Join 50k+ daily creators making the internet a funnier place, one
            translation at a time.
          </p>
          <Link
            to={ROUTES.CREATE}
            className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-10 text-lg font-bold text-[#6d3bd7] shadow-xl transition-transform duration-150 hover:scale-110 active:scale-95"
          >
            Make your first meme
          </Link>
        </div>
      </section>

      <footer className="border-t-2 border-[#2a2633] bg-[#0e0e0e] px-5 py-12 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-display text-3xl font-bold text-[#f9bd22]">
              <span className="text-[#ff7a2f]">▴</span> memeit
            </span>
            <p className="text-sm text-[#cbc3d7]">© 2025 memeit. stay chaotic.</p>
          </div>
          <p className="text-sm text-[#cbc3d7]">
            Made with <span className="pulse-pop inline-block text-[#d0bcff]">♥</span> by the community
          </p>
          <a
            href="https://github.com"
            aria-label="GitHub"
            className="rounded-btn p-2 text-[#cbc3d7] transition-colors duration-150 hover:text-[#ffb2b7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d0bcff]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.93.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.99c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9v2.81c0 .27.18.59.69.49A10.16 10.16 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  )
}

type SortMode = 'latest' | 'trending'
type LanguageFilter = 'all' | 'en' | 'ne' | 'hi' | 'ru' | 'zh'

const LANGUAGE_FILTERS: Array<{ value: LanguageFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'en', label: 'English' },
  { value: 'ne', label: 'नेपाली' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
]


function SortBar({
  sortMode,
  onSortModeChange,
  languageFilter,
  onLanguageFilterChange,
}: {
  sortMode: SortMode
  onSortModeChange: (value: SortMode) => void
  languageFilter: LanguageFilter
  onLanguageFilterChange: (value: LanguageFilter) => void
}) {
  return (
    <div className="sticky top-20 z-30 mb-4 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur-[12px] sm:top-20 sm:rounded-[10px] sm:border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-full bg-[#111111] p-1">
          {(['latest', 'trending'] as const).map((mode) => {
            const isActive = sortMode === mode

            return (
              <button
                key={mode}
                type="button"
                onClick={() => onSortModeChange(mode)}
                className={[
                  'h-8 rounded-full px-4 text-[13px] font-medium capitalize transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]',
                  isActive
                    ? 'bg-[#7c3aed] text-white'
                    : 'text-[#a1a1a1] hover:text-[#ededed]',
                ].join(' ')}
              >
                {mode}
              </button>
            )
          })}
        </div>

        <label className="sr-only" htmlFor="feed-language-filter">
          Filter by language
        </label>
        <select
          id="feed-language-filter"
          value={languageFilter}
          onChange={(event) => onLanguageFilterChange(event.target.value as LanguageFilter)}
          className="h-9 rounded-[6px] border border-[#2a2a2a] bg-[#111111] px-3 text-[13px] font-medium text-[#ededed] outline-none transition-colors duration-[120ms] hover:border-[#3a3a3a] focus:border-[#7c3aed]"
        >
          {LANGUAGE_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function FeedErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <section className="rounded-[10px] border border-[#2a2a2a] bg-[#111111] px-6 py-16 text-center">
      <p className="text-[15px] font-medium leading-[1.6] text-[#ef4444]">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-[6px] border border-[#2a2a2a] bg-transparent px-5 text-[13px] font-medium text-[#a1a1a1] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
      >
        Try again
      </button>
    </section>
  )
}

function EmptyFeedState() {
  return (
    <section className="rounded-[10px] border border-[#2a2a2a] bg-[#111111] px-6 py-16 text-center">
      <div className="mx-auto mb-4 text-5xl" aria-hidden="true">
        🎭
      </div>
      <h2 className="text-xl font-semibold text-[#ededed]">No memes yet</h2>
      <p className="mt-2 text-[15px] leading-[1.6] text-[#a1a1a1]">
        Be the first to create one
      </p>
      <Link
        to={ROUTES.CREATE}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-[6px] bg-[#7c3aed] px-5 text-[13px] font-medium text-white transition-colors duration-[120ms] hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#6d28d9]"
      >
        Create a meme
      </Link>
    </section>
  )
}

function FeedPage() {
  const [sortMode, setSortMode] = useState<SortMode>('latest')
  const {
    memes,
    loading,
    loadingMore,
    error,
    hasMore,
    language,
    loadMore,
    filterByLanguage,
    refresh,
  } = useFeed()
  const languageFilter = (language ?? 'all') as LanguageFilter

  const handleLanguageFilterChange = (value: LanguageFilter) => {
    void filterByLanguage(value === 'all' ? null : value)
  }

  const handleLoadMore = () => {
    void loadMore()
  }

  const handleRetry = () => {
    void refresh()
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#0a0a0a] pb-24 pt-4 text-[#ededed] sm:px-4 sm:pt-6">
      <div className="mx-auto w-full max-w-[680px]">
        <SortBar
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          languageFilter={languageFilter}
          onLanguageFilterChange={handleLanguageFilterChange}
        />

        <div className="flex flex-col gap-4 px-0 sm:px-0">
          {loading ? (
            <>
              <MemeCardSkeleton />
              <MemeCardSkeleton />
              <MemeCardSkeleton />
            </>
          ) : error ? (
            <FeedErrorState message={error} onRetry={handleRetry} />
          ) : memes.length > 0 ? (
            memes.map((meme) => (
              <MemeCard
                key={meme.id}
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
            ))
          ) : (
            <EmptyFeedState />
          )}
        </div>

        {hasMore && !loading ? (
          <div className="mb-12 mt-6 flex justify-center px-4">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#2a2a2a] bg-transparent px-5 text-[13px] font-medium text-[#a1a1a1] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-[#a1a1a1] border-t-transparent"
                  aria-hidden="true"
                />
              ) : null}
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        ) : null}
      </div>

      <Link
        to={ROUTES.CREATE}
        aria-label="Create a meme"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#7c3aed] text-3xl font-medium leading-none text-white shadow-[0_4px_20px_#7c3aed40] transition-colors duration-[120ms] hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#6d28d9] sm:hidden"
      >
        +
      </Link>
    </main>
  )
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LandingPage />
  }

  return <FeedPage />
}
