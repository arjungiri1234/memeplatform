import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTemplates } from '../hooks/useTemplates'
import { ROUTES } from '../lib/constants'
import type { Template } from '../lib/types'

const CATEGORIES: ReadonlyArray<{ label: string; value: string | null }> = [
  { label: 'All', value: null },
  { label: 'Reaction', value: 'reaction' },
  { label: 'Animal', value: 'animal' },
  { label: 'Text', value: 'text' },
  { label: 'Custom', value: 'custom' },
]

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function SkeletonGrid() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="aspect-[4/3] animate-pulse rounded-[8px] bg-[#1a1a1a]"
        />
      ))}
    </>
  )
}

function TemplateCard({
  template,
  onClick,
}: {
  template: Template
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[4/3] overflow-hidden rounded-[8px] border border-[#2a2a2a] bg-[#111111] transition-all duration-150 ease-out hover:scale-[1.02] hover:border-[#7c3aed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
    >
      <img
        src={template.image_url}
        alt={template.name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <p className="truncate text-[13px] font-medium leading-[1.4] text-white">
          {template.name}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-[#7c3aed]">
          Use this →
        </p>
      </div>
    </button>
  )
}

export default function TemplatePickerPage() {
  const navigate = useNavigate()
  const { templates, loading, error, activeCategory, filterByCategory, refresh } =
    useTemplates()
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = searchTerm
    ? templates.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : templates

  const handleTemplateClick = (template: Template) => {
    navigate(
      `${ROUTES.EDITOR}?templateId=${template.id}&imageUrl=${encodeURIComponent(template.image_url)}`,
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0a0a] text-[#ededed]">
      {/* Sub-header */}
      <div className="border-b border-[#2a2a2a]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.FEED}
              aria-label="Back to feed"
              className="flex h-9 w-9 items-center justify-center rounded-[6px] text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
            >
              <BackIcon />
            </Link>
            <h1 className="text-[15px] font-semibold leading-[1.5] text-[#ededed]">
              Choose a template
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate(`${ROUTES.EDITOR}?mode=upload`)}
              className="h-9 rounded-[6px] px-3 text-[13px] font-medium text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
            >
              Upload my own →
            </button>
            <button
              type="button"
              onClick={() => navigate(`${ROUTES.EDITOR}?mode=generate`)}
              className="h-9 rounded-[6px] px-3 text-[13px] font-medium text-[#7c3aed] transition-colors duration-[120ms] hover:bg-[#1e1030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1e1030]"
            >
              Skip to AI →
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="h-10 w-full rounded-[6px] border border-[#2a2a2a] bg-[#111111] pl-9 pr-4 text-[14px] text-[#ededed] outline-none transition-colors duration-[120ms] placeholder:text-[#555555] hover:border-[#3a3a3a] focus:border-[#7c3aed]"
          />
        </div>

        {/* Category pills — horizontally scrollable, no wrap */}
        <div className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value

            return (
              <button
                key={String(cat.value)}
                type="button"
                onClick={() => filterByCategory(cat.value)}
                className={[
                  'shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]',
                  isActive
                    ? 'bg-[#7c3aed] text-white'
                    : 'border border-[#2a2a2a] text-[#a1a1a1] hover:border-[#3a3a3a] hover:text-[#ededed]',
                ].join(' ')}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <p className="text-[13px] leading-[1.5] text-[#ef4444]">{error}</p>
              <button
                type="button"
                onClick={refresh}
                className="mt-4 h-9 rounded-[6px] border border-[#2a2a2a] px-4 text-[13px] font-medium text-[#ededed] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <span className="text-4xl" role="img" aria-label="masks">🎭</span>
              <p className="mt-3 text-[15px] font-medium leading-[1.6] text-[#ededed]">
                No templates found
              </p>
              <p className="mt-1 text-[13px] leading-[1.5] text-[#a1a1a1]">
                Try a different category
              </p>
            </div>
          ) : (
            filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => handleTemplateClick(template)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
