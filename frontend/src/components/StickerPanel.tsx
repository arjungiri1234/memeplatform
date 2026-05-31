import { useState } from 'react'

interface StickerPanelProps {
  onStickerSelect: (emoji: string) => void
}

const STICKER_CATEGORIES = [
  {
    label: 'Reactions',
    emojis: ['😂', '💀', '🤣', '😭', '😤', '🤦', '🙄', '😩', '🥲', '😅'],
  },
  {
    label: 'Fire / Hype',
    emojis: ['🔥', '✨', '💯', '👑', '🚀', '💪', '🎯', '⚡', '🏆', '💥'],
  },
  {
    label: 'Animals',
    emojis: ['🐸', '🐶', '🐱', '🦆', '🦅', '🐻', '🦁', '🐼', '🦊', '🐸'],
  },
  {
    label: 'Hands',
    emojis: ['👏', '🤝', '👀', '🫡', '🤌', '👆', '💅', '🙏', '🫶', '✌️'],
  },
  {
    label: 'Food',
    emojis: ['🍕', '🍜', '🧋', '🍛', '🥘', '🫓', '🍩', '🌮', '🥗', '🍱'],
  },
] as const

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={[
        'h-4 w-4 transition-transform duration-[120ms]',
        expanded ? 'rotate-180' : '',
      ].join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function StickerPanel({ onStickerSelect }: StickerPanelProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="rounded-[10px] border border-[#2a2a2a] bg-[#111111]">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-[10px] px-4 text-left text-[13px] font-medium text-[#ededed] transition-colors duration-[120ms] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
        aria-expanded={expanded}
      >
        <span>Stickers 😂</span>
        <ChevronIcon expanded={expanded} />
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-[#2a2a2a] p-4">
          {STICKER_CATEGORIES.map((category) => (
            <div key={category.label} className="space-y-2">
              <h3 className="text-[11px] font-medium uppercase leading-[1.4] tracking-normal text-[#555555]">
                {category.label}
              </h3>
              <div className="grid grid-cols-6 gap-1">
                {category.emojis.map((emoji, index) => (
                  <button
                    key={`${category.label}-${emoji}-${index}`}
                    type="button"
                    onClick={() => onStickerSelect(emoji)}
                    className="flex h-9 w-9 items-center justify-center rounded-[6px] text-xl transition-colors duration-[120ms] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
                    aria-label={`Add ${emoji} sticker`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
