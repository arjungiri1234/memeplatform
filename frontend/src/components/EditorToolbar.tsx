import type { TextObject } from './MemeEditor'

interface EditorToolbarProps {
  selectedText: TextObject | null
  onTextChange: (id: string, changes: Partial<TextObject>) => void
  onAddText: () => void
  onDeleteText: (id: string) => void
}

const FONT_FAMILIES = [
  'Impact',
  'Anton',
  'Arial',
  'Arial Black',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Comic Sans MS',
] as const

const TEXT_COLORS = [
  { label: 'White', value: '#ffffff', className: 'bg-[#ffffff]' },
  { label: 'Black', value: '#000000', className: 'bg-[#000000]' },
  { label: 'Gray', value: '#a1a1a1', className: 'bg-[#a1a1a1]' },
  { label: 'Yellow', value: '#fbbf24', className: 'bg-[#fbbf24]' },
  { label: 'Orange', value: '#f97316', className: 'bg-[#f97316]' },
  { label: 'Red', value: '#ef4444', className: 'bg-[#ef4444]' },
  { label: 'Pink', value: '#ec4899', className: 'bg-[#ec4899]' },
  { label: 'Green', value: '#22c55e', className: 'bg-[#22c55e]' },
  { label: 'Cyan', value: '#06b6d4', className: 'bg-[#06b6d4]' },
  { label: 'Blue', value: '#3b82f6', className: 'bg-[#3b82f6]' },
  { label: 'Purple', value: '#8b5cf6', className: 'bg-[#8b5cf6]' },
] as const

const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 120
const FONT_SIZE_STEP = 4

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

function Divider() {
  return <div className="hidden h-8 w-px shrink-0 bg-[#2a2a2a] xl:block" />
}

function clampFontSize(size: number): number {
  return Math.min(Math.max(size, MIN_FONT_SIZE), MAX_FONT_SIZE)
}

export default function EditorToolbar({
  selectedText,
  onTextChange,
  onAddText,
  onDeleteText,
}: EditorToolbarProps) {
  const currentFontFamily = selectedText?.fontFamily ?? 'Impact'
  const currentFontSize = selectedText?.fontSize ?? 32
  const currentFill = selectedText?.fill.toLowerCase() ?? '#ffffff'
  const outlineEnabled = selectedText ? selectedText.strokeWidth > 0 : false

  const handleFontSizeChange = (nextSize: number) => {
    if (!selectedText) {
      return
    }

    onTextChange(selectedText.id, {
      fontSize: clampFontSize(nextSize),
    })
  }

  return (
    <div className="border-b border-[#2a2a2a] bg-[#111111] px-4 py-4">
      {selectedText ? (
        <div className="mb-3">
          <input
            type="text"
            value={selectedText.text}
            onChange={(event) => {
              onTextChange(selectedText.id, { text: event.target.value })
            }}
            onBlur={(event) => {
              if (!event.target.value.trim()) {
                onTextChange(selectedText.id, { text: 'Text' })
              }
            }}
            placeholder="Type your text..."
            className="h-9 w-full rounded-[6px] border border-[#7c3aed] bg-[#0a0a0a] px-3 text-sm text-[#ededed] outline-none placeholder:text-[#555555]"
          />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onAddText}
            className="h-8 rounded-[6px] px-3 text-[13px] font-medium text-[#ededed] transition-colors duration-[120ms] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
          >
            Add text
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedText) {
                onDeleteText(selectedText.id)
              }
            }}
            disabled={!selectedText}
            className="inline-flex h-8 items-center gap-1 rounded-[6px] border border-transparent px-3 text-[13px] font-medium text-[#ef4444] transition-colors duration-[120ms] hover:border-[#ef4444] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:text-[#555555] disabled:hover:border-transparent disabled:hover:bg-transparent"
          >
            <TrashIcon />
            Delete
          </button>
        </div>

        <Divider />

        <select
          aria-label="Font family"
          value={currentFontFamily}
          disabled={!selectedText}
          onChange={(event) => {
            if (selectedText) {
                onTextChange(selectedText.id, { fontFamily: event.target.value })
            }
          }}
          className="h-9 w-52 shrink-0 rounded-[6px] border border-[#2a2a2a] bg-[#111111] px-3 text-[13px] text-[#ededed] outline-none transition-colors duration-[120ms] hover:border-[#3a3a3a] focus:border-[#7c3aed] disabled:cursor-not-allowed disabled:text-[#555555]"
        >
          {FONT_FAMILIES.map((fontFamily) => (
            <option key={fontFamily} value={fontFamily}>
              {fontFamily}
            </option>
          ))}
        </select>

        <Divider />

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => handleFontSizeChange(currentFontSize - FONT_SIZE_STEP)}
            disabled={!selectedText || currentFontSize <= MIN_FONT_SIZE}
            aria-label="Decrease font size"
            className="h-8 w-8 rounded-[6px] border border-[#2a2a2a] text-[15px] font-medium text-[#ededed] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:text-[#555555]"
          >
            -
          </button>
          <span className="min-w-8 text-center text-[13px] font-medium text-[#ededed]">
            {currentFontSize}
          </span>
          <button
            type="button"
            onClick={() => handleFontSizeChange(currentFontSize + FONT_SIZE_STEP)}
            disabled={!selectedText || currentFontSize >= MAX_FONT_SIZE}
            aria-label="Increase font size"
            className="h-8 w-8 rounded-[6px] border border-[#2a2a2a] text-[15px] font-medium text-[#ededed] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:text-[#555555]"
          >
            +
          </button>
        </div>

        <Divider />

        <div className="flex shrink-0 flex-wrap items-center gap-1">
          {TEXT_COLORS.map((color) => {
            const isActive = currentFill === color.value

            return (
              <button
                key={color.value}
                type="button"
                aria-label={`Set text color ${color.label}`}
                disabled={!selectedText}
                onClick={() => {
                  if (selectedText) {
                    onTextChange(selectedText.id, { fill: color.value })
                  }
                }}
                className={[
                  'h-7 w-7 rounded-full border border-[#2a2a2a] transition duration-[120ms] hover:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100',
                  color.className,
                  isActive && selectedText
                    ? 'ring-2 ring-[#7c3aed] ring-offset-2 ring-offset-[#111111]'
                    : '',
                ].join(' ')}
              />
            )
          })}
        </div>

        <Divider />

        <button
          type="button"
          disabled={!selectedText}
          onClick={() => {
            if (selectedText) {
              onTextChange(selectedText.id, {
                stroke: '#000000',
                strokeWidth: outlineEnabled ? 0 : 2,
              })
            }
          }}
          className="h-8 shrink-0 rounded-[6px] border border-[#2a2a2a] px-3 text-[13px] font-medium text-[#ededed] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:text-[#555555] disabled:hover:border-[#2a2a2a] disabled:hover:bg-transparent"
        >
          Outline {outlineEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  )
}
