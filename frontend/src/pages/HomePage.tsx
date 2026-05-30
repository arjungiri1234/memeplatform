import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useState, useRef, useEffect, forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import MemeCard, { MemeCardSkeleton } from '../components/MemeCard'
import { useAuth } from '../hooks/useAuth'
import { useFeed } from '../hooks/useFeed'
import { getLoginRoute, ROUTES } from '../lib/constants'

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
  { src: '/memes/zomato.png', alt: 'Community meme' },
  { src: '/memes/chasma.png', alt: 'Community meme' },
  { src: '/memes/akshay.png', alt: 'Community meme' },
  { src: '/memes/kp.png', alt: 'Community meme' },
  { src: '/memes/idhar.png', alt: 'Community meme' },
  { src: '/memes/titanic.png', alt: 'Community meme' },
  { src: '/memes/tony.png', alt: 'Community meme' },
  { src: '/memes/crying.png', alt: 'Community meme' },
] as const

const HERO_LANGUAGE_CHIPS = [
  { label: '[नेपाली]', color: '#ffb2b7' },
  { label: '[हिन्दी]', color: '#d0bcff' },
  { label: '[Español]', color: '#f9bd22' },
  { label: '[中文]', color: '#e5e2e1' },
  { label: '[Русский]', color: '#a8d8a8' },
] as const

const CREATE_ACCOUNT_ROUTE = getLoginRoute({
  mode: 'signup',
  redirectTo: ROUTES.CREATE,
})

const STEPS = [
  {
    label: '01',
    title: 'Pick a Template',
    body: 'Upload your own image or browse hundreds of trending formats — reaction faces, news clips, all of it.',
    icon: (
      <path d="M8 3h6l4 4v14H8V3Zm6 0v5h5M11 15h4M13 13v4" />
    ),
  },
  {
    label: '02',
    title: 'Add Your Context',
    body: 'Type your caption in any language. AI gets the slang, the sarcasm, the cultural references — not just the words.',
    icon: (
      <path d="M4 5h9M8.5 5c0 4-1.5 7-4.5 9M6.5 9c1 2 2.5 3.7 5 5M15 12l5 9M16 18h3M17.5 12 13 21" />
    ),
  },
  {
    label: '03',
    title: 'Go Viral',
    body: "Publish to the global feed and watch the whole world get the joke. No translation needed.",
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

interface HeroMemeCardProps {
  className: string
  caption: string
  tint: string
  border: string
  imageSrc?: string
  imageAlt?: string
  captionBg?: string
  captionColor?: string
}

const HeroMemeCard = forwardRef<HTMLDivElement, HeroMemeCardProps>(function HeroMemeCard(
  { className, caption, tint, border, imageSrc, imageAlt, captionBg = '#ffffff', captionColor = '#000000' },
  ref,
) {
  return (
    <div
      ref={ref}
      className={['absolute w-56 rounded-[10px] border bg-[#111111] p-2 sm:w-72', className].join(' ')}
      style={{ borderColor: border }}
    >
      <div className="aspect-[16/9]">
        <PortraitPlaceholder tint={tint} label="" imageSrc={imageSrc} imageAlt={imageAlt} />
      </div>
      <p
        className="mt-2 rounded-md border border-black/20 px-2 py-2 text-center font-meme text-2xl uppercase leading-none shadow-[2px_2px_0_rgba(0,0,0,0.45)]"
        style={{ backgroundColor: captionBg, color: captionColor }}
      >
        {caption}
      </p>
    </div>
  )
})

function LanguageCard({ card, index }: { card: (typeof LANGUAGE_CARDS)[number]; index: number }) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl bg-[#111111] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
      style={{ border: `1px solid ${card.border}45` }}
    >
      <div className="absolute left-2.5 top-2.5 z-10 rounded bg-black/65 px-2 py-0.5 backdrop-blur-sm">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">
          {card.code}
        </span>
      </div>
      <div className="aspect-[3/4] w-full overflow-hidden">
        <PortraitPlaceholder
          tint={card.tint}
          label=""
          imageSrc={card.imageSrc}
          imageAlt={card.imageAlt}
          imageFit="contain"
        />
      </div>
      <div className="px-3 pb-3 pt-2.5" style={{ borderTop: `1px solid ${card.border}30` }}>
        <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-[0.1em] text-white/30">
          {card.name}
        </span>
        <p className="font-meme text-sm uppercase leading-tight text-white">
          {card.caption}
        </p>
      </div>
    </motion.article>
  )
}

function MarqueeTile({ item }: { item: (typeof MARQUEE_ITEMS)[number] }) {
  return (
    <div className="h-44 w-64 shrink-0 overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#111111] transition-all duration-300 hover:scale-[1.04] hover:border-[#00e676]/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      <img
        src={item.src}
        alt={item.alt}
        className="h-full w-full object-cover object-center"
      />
    </div>
  )
}

// Framer Motion stagger variants for language chips
const chipContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
}
const chipItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

function LandingPage() {
  const shouldReduceMotion = useReducedMotion() ?? false

  // GSAP refs — hero cards
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)

  // GSAP ref — marquee tween (for pause/resume on hover)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const marqueeTweenRef = useRef<gsap.core.Tween | null>(null)

  // Animation 2 — GSAP hero card entrance + continuous float + hover
  useEffect(() => {
    if (shouldReduceMotion) return
    const c1 = card1Ref.current
    const c2 = card2Ref.current
    const c3 = card3Ref.current
    if (!c1 || !c2 || !c3) return

    const tl = gsap.timeline()
    tl.fromTo(c1,
      { opacity: 0, x: 60, rotation: -8, scale: 0.85 },
      { opacity: 1, x: 0, rotation: -6, scale: 0.85, duration: 0.6, ease: 'power2.out', delay: 0.3 },
    )
    .fromTo(c2,
      { opacity: 0, x: 60, rotation: 5, scale: 0.92 },
      { opacity: 1, x: 0, rotation: 3, scale: 0.92, duration: 0.6, ease: 'power2.out' },
      0.45,
    )
    .fromTo(c3,
      { opacity: 0, x: 60, xPercent: -50, scale: 0.9 },
      { opacity: 1, x: 0, xPercent: -50, rotation: 0, scale: 1, duration: 0.6, ease: 'power2.out' },
      0.6,
    )

    const floatFront = gsap.to(c3, { y: -10, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    const floatMid   = gsap.to(c2, { y: -5,  duration: 3,   ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 })

    const onEnter1 = () => gsap.to(c1, { scale: 1.04, rotation: -3, duration: 0.3, ease: 'power2.out' })
    const onLeave1 = () => gsap.to(c1, { scale: 0.85, rotation: -6, duration: 0.3, ease: 'power2.out' })
    const onEnter2 = () => gsap.to(c2, { scale: 1.0,  rotation: 6,  duration: 0.3, ease: 'power2.out' })
    const onLeave2 = () => gsap.to(c2, { scale: 0.92, rotation: 3,  duration: 0.3, ease: 'power2.out' })
    const onEnter3 = () => gsap.to(c3, { scale: 1.04, rotation: 2,  duration: 0.3, ease: 'power2.out' })
    const onLeave3 = () => gsap.to(c3, { scale: 1,    rotation: 0,  duration: 0.3, ease: 'power2.out' })

    c1.addEventListener('mouseenter', onEnter1)
    c1.addEventListener('mouseleave', onLeave1)
    c2.addEventListener('mouseenter', onEnter2)
    c2.addEventListener('mouseleave', onLeave2)
    c3.addEventListener('mouseenter', onEnter3)
    c3.addEventListener('mouseleave', onLeave3)

    return () => {
      tl.kill()
      floatFront.kill()
      floatMid.kill()
      gsap.killTweensOf([c1, c2, c3])
      c1.removeEventListener('mouseenter', onEnter1)
      c1.removeEventListener('mouseleave', onLeave1)
      c2.removeEventListener('mouseenter', onEnter2)
      c2.removeEventListener('mouseleave', onLeave2)
      c3.removeEventListener('mouseenter', onEnter3)
      c3.removeEventListener('mouseleave', onLeave3)
    }
  }, [shouldReduceMotion])

  // Animation 6 — GSAP infinite marquee (pause on hover)
  useEffect(() => {
    if (shouldReduceMotion || !marqueeRef.current) return
    const tween = gsap.to(marqueeRef.current, { x: '-50%', duration: 20, ease: 'none', repeat: -1 })
    marqueeTweenRef.current = tween
    return () => { tween.kill() }
  }, [shouldReduceMotion])

  return (
    <div className="min-h-screen overflow-hidden bg-[#0f0f0f] text-[#e5e2e1]">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100vh-80px)] flex-col items-center gap-12 px-5 pb-16 pt-20 md:flex-row md:px-16">
        <div className="relative z-10 flex w-full flex-col gap-6 md:w-1/2">

          {/* Animation 1 — badge */}
          <motion.div
            className="inline-flex w-fit items-center rounded-pill border border-[#00e676]/60 bg-[#00e676]/10 px-4 py-1"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0 }}
          >
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#00e676]">
              AI-powered · 5 languages · free
            </span>
          </motion.div>

          {/* Animation 1 — headline, each line staggered */}
          <h1 className="font-display text-[42px] font-bold leading-[1.05] tracking-normal text-white md:text-[64px]">
            <motion.span className="block"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            >Make memes</motion.span>
            <motion.span className="block"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            >the whole</motion.span>
            <motion.span className="block"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
            >
              <span className="text-[#00e676]">world gets</span>
              <span className="ml-3 inline-block h-8 w-8 rounded-full bg-[#00e676] align-middle md:h-11 md:w-11" />
            </motion.span>
          </h1>

          {/* Animation 1 — subtext */}
          <motion.p
            className="max-w-md text-base font-medium leading-[1.6] text-[#a1a1a1] md:text-lg"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
          >
            Don&apos;t let language stop the vibes. Create viral memes in 5 major
            languages using AI that actually gets the context.
          </motion.p>

          {/* Animation 1 + 5 — language chips with stagger + hover */}
          <motion.div
            className="flex flex-wrap gap-2 py-1"
            variants={chipContainerVariants}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={shouldReduceMotion ? {} : 'show'}
          >
            {HERO_LANGUAGE_CHIPS.map((chip) => (
              <motion.span
                key={chip.label}
                variants={shouldReduceMotion ? undefined : chipItemVariants}
                whileHover={shouldReduceMotion ? {} : { scale: 1.08, y: -2, transition: { duration: 0.15 } }}
                className="rounded-pill border border-[#2a2a2a] bg-[#111111] px-3 py-1 text-sm font-bold text-[#a1a1a1] transition-colors duration-[120ms] hover:border-[#00e676]/60 hover:bg-[#00e676]/10 hover:text-[#00e676]"
              >
                {chip.label}
              </motion.span>
            ))}
          </motion.div>

          {/* Animation 1 + 5 — CTA button entrance + spring micro-interaction */}
          <motion.div
            className="flex flex-wrap gap-4 pt-2"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.65 }}
          >
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                to={CREATE_ACCOUNT_ROUTE}
                className="inline-flex h-12 items-center justify-center rounded-[6px] border border-[#00e676] bg-[#00e676] px-8 font-bold text-[#052e1a] transition-colors duration-[120ms] hover:bg-[#37f28f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] active:bg-[#00c965]"
              >
                Create Now
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animation 2 — GSAP card stack (refs, no Tailwind rotation) */}
        <div className="relative z-10 mx-auto h-[520px] w-full max-w-[620px] md:w-1/2">
          <HeroMemeCard ref={card1Ref}
            caption="My brain at 3am." tint="#172f2b" border="#00e676"
            imageSrc="/memes/spanish.png" imageAlt="Spanish meme"
            captionBg="#00e676" captionColor="#052e1a"
            className="left-[4%] top-10"
          />
          <HeroMemeCard ref={card2Ref}
            caption="Nobody asked this" tint="#342222" border="#00e676"
            imageSrc="/memes/donaldtrump.png" imageAlt="Donald Trump meme"
            captionBg="#111111" captionColor="#ededed"
            className="right-[3%] top-12 z-10"
          />
          <HeroMemeCard ref={card3Ref}
            caption="होइन होला कि हो?" tint="#2f2418" border="#00e676"
            imageSrc="/memes/hoinahola.png" imageAlt="Nepali meme"
            captionBg="#111111" captionColor="#ededed"
            className={`bottom-0 left-[38%] z-20${shouldReduceMotion ? ' -translate-x-1/2' : ''}`}
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      {/* Animation 3 — section heading scroll reveal */}
      <section className="bg-[#0e0e0e] px-5 py-24 md:px-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="flex flex-col items-center text-center"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 inline-flex items-center rounded-pill border border-[#00e676]/30 bg-[#00e676]/[0.08] px-4 py-1">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#00e676]">Simple process</span>
            </div>
            <h2 className="mb-14 font-display text-3xl font-bold text-white md:text-4xl">Meme in 3 moves.</h2>
          </motion.div>

          {/* Animation 3 — step cards stagger */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#111111] p-8 transition-all duration-300 hover:border-[#00e676]/30"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <span className="pointer-events-none absolute right-4 top-1 select-none font-display text-[96px] font-extrabold leading-none text-[#00e676]/[0.06] transition-all duration-500 group-hover:text-[#00e676]/[0.13]">
                  {step.label}
                </span>
                <div className="mb-6 h-0.5 w-8 rounded-full bg-[#00e676]" />
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00e676]/10 text-[#00e676] ring-1 ring-[#00e676]/20">
                  <Icon>{step.icon}</Icon>
                </div>
                <h3 className="mb-3 font-display text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-[1.65] text-[#a1a1a1]">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LANGUAGE CARDS ───────────────────────────────── */}
      {/* Animation 3 — section heading + card stagger (each card animates in LanguageCard) */}
      <section className="px-5 py-24 md:px-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="flex flex-col items-center text-center"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 inline-flex items-center rounded-pill border border-[#00e676]/30 bg-[#00e676]/[0.08] px-4 py-1">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#00e676]">5 languages · 1 vibe</span>
            </div>
            <h2 className="mb-14 font-display text-3xl font-bold text-white md:text-4xl">Humor has no language barrier.</h2>
          </motion.div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {LANGUAGE_CARDS.map((card, i) => (
              <LanguageCard key={card.code} card={card} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY MARQUEE ────────────────────────────── */}
      {/* Animation 6 — GSAP infinite scroll, pause on hover */}
      <section className="border-y border-[#1e1e1e] bg-[#0a0a0a] py-20">
        <motion.div
          className="mx-auto mb-12 flex max-w-6xl flex-col items-center px-5 text-center md:px-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-3 inline-flex items-center rounded-pill border border-[#00e676]/30 bg-[#00e676]/[0.08] px-4 py-1">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#00e676]">Community</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Fresh from the community.</h2>
        </motion.div>
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => marqueeTweenRef.current?.pause()}
          onMouseLeave={() => marqueeTweenRef.current?.resume()}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#0a0a0a] to-transparent md:w-48" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-[#0a0a0a] to-transparent md:w-48" />
          {/* 2 copies — GSAP animates to -50% for seamless loop */}
          <div ref={marqueeRef} className="flex w-max gap-4 px-4">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <MarqueeTile key={`${item.src}-${i}`} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      {/* Animation 3 — scroll reveal + Animation 5 — button spring */}
      <section className="px-5 py-24 md:px-16">
        <motion.div
          className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#0f0f0f] p-14 text-center md:p-24"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,_rgba(0,230,118,0.07)_0%,_transparent_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00e676]/40 to-transparent" />
          <div className="relative z-10 inline-flex items-center rounded-pill border border-[#00e676]/30 bg-[#00e676]/[0.08] px-4 py-1">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#00e676]">Free to start</span>
          </div>
          <h2 className="relative z-10 font-display text-4xl font-bold leading-[1.05] text-white md:text-[56px]">
            Your meme is waiting.
          </h2>
          <p className="relative z-10 max-w-sm text-base leading-[1.75] text-[#a1a1a1]">
            Thousands of creators make the internet funnier every day — in every language. Join them.
          </p>
          <motion.div
            className="relative z-10"
            whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Link
              to={CREATE_ACCOUNT_ROUTE}
              className="inline-flex h-12 items-center justify-center rounded-[6px] border border-[#00e676] bg-[#00e676] px-10 font-bold text-[#052e1a] transition-colors duration-[120ms] hover:bg-[#37f28f] hover:ring-2 hover:ring-[#00e676]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] active:bg-[#00c965]"
            >
              Make your first meme
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-[#1e1e1e] bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-center md:flex-row md:px-16 md:text-left">
          <span className="font-display text-lg font-bold text-white">meme<span className="text-[#00e676]">it</span></span>
          <p className="cursor-default text-[12px] text-[#3a3a3a] transition-colors duration-150 hover:text-[#4a4a4a]">© 2025 memeit. All rights reserved.</p>
          <p className="cursor-default text-[12px] text-[#3a3a3a] transition-colors duration-150 hover:text-[#4a4a4a]">Built for the internet, in every language.</p>
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
    <div className="sticky top-16 z-30 mb-4 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur-[12px] sm:top-16 sm:rounded-[10px] sm:border">
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
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const { user: currentUser } = useAuth()
  const {
    memes,
    loading,
    loadingMore,
    error,
    hasMore,
    language,
    deletingMemeId,
    loadMore,
    filterByLanguage,
    deleteMeme,
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

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return

    void deleteMeme(deleteTargetId).then(() => {
      setDeleteTargetId(null)
    })
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
                canDelete={meme.user_id === currentUser?.id}
                deleting={deletingMemeId === meme.id}
                onDelete={setDeleteTargetId}
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

      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        deleting={deletingMemeId === deleteTargetId}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
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
