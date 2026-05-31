import { useEffect, useRef, useState } from 'react'

const LANGUAGE_BADGE_COLOR: Record<string, string> = {
  en: '#8b5cf6',
  ne: '#f43f5e',
  hi: '#f59e0b',
  ru: '#06b6d4',
  zh: '#ef4444',
}

const LANGUAGE_BADGE_LABEL: Record<string, string> = {
  en: 'EN',
  ne: 'NE',
  hi: 'HI',
  ru: 'RU',
  zh: 'ZH',
}

interface CaptionSelectorProps {
  captions: string[]
  selectedCaption: string | null
  onSelect: (caption: string) => void
  language: string
}

export default function CaptionSelector({
  captions,
  selectedCaption,
  onSelect,
  language,
}: CaptionSelectorProps) {
  const [flashedCaption, setFlashedCaption] = useState<string | null>(null)
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup on unmount — prevents setState on unmounted component
  useEffect(() => {
    return () => {
      if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current)
    }
  }, [])

  function handleSelect(caption: string) {
    onSelect(caption)
    if (flashTimerRef.current !== null) clearTimeout(flashTimerRef.current)
    setFlashedCaption(caption)
    flashTimerRef.current = setTimeout(() => setFlashedCaption(null), 500)
  }

  const badgeColor = LANGUAGE_BADGE_COLOR[language] ?? '#8b5cf6'
  const badgeLabel = LANGUAGE_BADGE_LABEL[language] ?? language.slice(0, 2).toUpperCase()

  return (
    <div className="mt-3 rounded-[8px] border border-[#2a2a2a] bg-[#0d0d0d] p-3">
      {/* Label row */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
          Captions
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: badgeColor }}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Caption buttons */}
      <div>
        {captions.map((caption) => {
          const isFlashed  = flashedCaption === caption
          const isSelected = selectedCaption === caption && !isFlashed

          return (
            <button
              key={caption}
              type="button"
              onClick={() => handleSelect(caption)}
              className={[
                'mb-1.5 flex w-full items-center justify-between gap-2 rounded-[6px] border px-3 py-2.5 text-left text-[14px] leading-[1.5] transition-colors duration-[120ms] last:mb-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]',
                isFlashed
                  ? 'border-[#22c55e] bg-[#0d2818] text-[#22c55e]'
                  : isSelected
                    ? 'border-[#7c3aed] bg-[#1e1030] text-[#ededed]'
                    : 'border-[#2a2a2a] bg-[#111111] text-[#ededed] hover:border-[#3a3a3a] hover:bg-[#1a1a1a]',
              ].join(' ')}
            >
              <span className="flex-1">{caption}</span>
              {(isFlashed || isSelected) && (
                <span
                  className={isFlashed ? 'shrink-0 text-[#22c55e]' : 'shrink-0 text-[#7c3aed]'}
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Hint — hidden once any caption has been selected */}
      {!selectedCaption && (
        <p className="mt-2 text-[12px] leading-[1.5] text-[#555555]">
          Click a caption to add it to your meme
        </p>
      )}
    </div>
  )
}
