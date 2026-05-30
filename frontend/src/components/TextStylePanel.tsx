import type {
  HorizontalPosition,
  TextObject,
  VerticalPosition,
} from './MemeEditor'

interface TextStylePanelProps {
  selectedText: TextObject | null
  onAddText: () => void
  onDuplicateText: (id: string) => void
  onPositionText: (
    id: string,
    position: {
      horizontal?: HorizontalPosition
      vertical?: VerticalPosition
    },
  ) => void
  onTextChange: (id: string, changes: Partial<TextObject>) => void
}

const TEXT_COLORS = [
  { label: 'White', value: '#ffffff', className: 'bg-[#ffffff]' },
  { label: 'Black', value: '#000000', className: 'bg-[#000000]' },
  { label: 'Yellow', value: '#fbbf24', className: 'bg-[#fbbf24]' },
  { label: 'Red', value: '#ef4444', className: 'bg-[#ef4444]' },
  { label: 'Green', value: '#22c55e', className: 'bg-[#22c55e]' },
  { label: 'Blue', value: '#3b82f6', className: 'bg-[#3b82f6]' },
] as const

const FONT_FAMILIES = ['Impact', 'Anton', 'Arial', 'Arial Black', 'Inter', 'Georgia'] as const

const HORIZONTAL_POSITIONS: Array<{ label: string; value: HorizontalPosition }> = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
]

const VERTICAL_POSITIONS: Array<{ label: string; value: VerticalPosition }> = [
  { label: 'Top', value: 'top' },
  { label: 'Middle', value: 'middle' },
  { label: 'Bottom', value: 'bottom' },
]

const BUTTON_CLASS =
  'h-8 rounded-[6px] border border-[#2a2a2a] bg-transparent px-3 text-[12px] font-medium text-[#a1a1a1] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]'

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-medium uppercase leading-[1.4] text-[#555555]">
      {children}
    </p>
  )
}

export default function TextStylePanel({
  selectedText,
  onAddText,
  onDuplicateText,
  onPositionText,
  onTextChange,
}: TextStylePanelProps) {
  const selectedId = selectedText?.id

  const updateSelectedText = (changes: Partial<TextObject>) => {
    if (selectedId) {
      onTextChange(selectedId, changes)
    }
  }

  const resetStyle = () => {
    updateSelectedText({
      fontFamily: 'Impact',
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      opacity: 1,
    })
  }

  return (
    <section className="space-y-4 rounded-[10px] border border-[#2a2a2a] bg-[#111111] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-medium leading-[1.5] text-[#ededed]">
            Text style
          </h2>
          <p className="mt-1 text-[12px] leading-[1.5] text-[#555555]">
            {selectedText ? 'Editing selected layer' : 'Select text on the canvas'}
          </p>
        </div>
        <button
          type="button"
          onClick={onAddText}
          className="h-8 rounded-[6px] bg-[#7c3aed] px-3 text-[12px] font-medium text-white transition-colors duration-[120ms] hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#6d28d9]"
        >
          Add text
        </button>
      </div>

      {selectedText ? (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-2">
            <label className="space-y-1.5">
              <SectionLabel>Font</SectionLabel>
              <select
                value={selectedText.fontFamily}
                onChange={(event) => updateSelectedText({ fontFamily: event.target.value })}
                className="h-9 w-full rounded-[6px] border border-[#2a2a2a] bg-[#0a0a0a] px-2 text-[13px] text-[#ededed] outline-none transition-colors duration-[120ms] hover:border-[#3a3a3a] focus:border-[#7c3aed]"
              >
                {FONT_FAMILIES.map((fontFamily) => (
                  <option key={fontFamily} value={fontFamily}>
                    {fontFamily}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <SectionLabel>Size</SectionLabel>
              <input
                type="number"
                min={12}
                max={120}
                value={selectedText.fontSize}
                onChange={(event) => {
                  updateSelectedText({
                    fontSize: Math.min(Math.max(Number(event.target.value), 12), 120),
                  })
                }}
                className="h-9 w-full rounded-[6px] border border-[#2a2a2a] bg-[#0a0a0a] px-2 text-[13px] text-[#ededed] outline-none transition-colors duration-[120ms] hover:border-[#3a3a3a] focus:border-[#7c3aed]"
              />
            </label>
          </div>

          <div className="space-y-2">
            <SectionLabel>Text color</SectionLabel>
            <div className="flex flex-wrap items-center gap-2">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={`Set text color ${color.label}`}
                  onClick={() => updateSelectedText({ fill: color.value })}
                  className={[
                    'h-7 w-7 rounded-full border border-[#2a2a2a] transition-transform duration-[120ms] hover:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]',
                    color.className,
                    selectedText.fill.toLowerCase() === color.value
                      ? 'ring-2 ring-[#7c3aed] ring-offset-2 ring-offset-[#111111]'
                      : '',
                  ].join(' ')}
                />
              ))}
              <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#2a2a2a] bg-[#1a1a1a] text-[12px] text-[#a1a1a1] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:text-[#ededed] focus-within:ring-2 focus-within:ring-[#7c3aed]">
                +
                <input
                  type="color"
                  value={selectedText.fill}
                  onChange={(event) => updateSelectedText({ fill: event.target.value })}
                  aria-label="Choose custom text color"
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <SectionLabel>Outline thickness</SectionLabel>
              <span className="text-[12px] font-medium text-[#a1a1a1]">
                {selectedText.strokeWidth}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              step={1}
              value={selectedText.strokeWidth}
              onChange={(event) => updateSelectedText({ strokeWidth: Number(event.target.value) })}
              aria-label="Outline thickness"
              className="h-1.5 w-full cursor-pointer accent-[#7c3aed]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <SectionLabel>Opacity</SectionLabel>
              <span className="text-[12px] font-medium text-[#a1a1a1]">
                {Math.round(selectedText.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={selectedText.opacity * 100}
              onChange={(event) => updateSelectedText({ opacity: Number(event.target.value) / 100 })}
              aria-label="Text opacity"
              className="h-1.5 w-full cursor-pointer accent-[#7c3aed]"
            />
          </div>

          <div className="space-y-2">
            <SectionLabel>Alignment</SectionLabel>
            <div className="grid grid-cols-3 gap-1 rounded-[6px] border border-[#2a2a2a] bg-[#0a0a0a] p-1">
              {HORIZONTAL_POSITIONS.map((position) => (
                <button
                  key={position.value}
                  type="button"
                  onClick={() => onPositionText(selectedText.id, { horizontal: position.value })}
                  className="h-8 rounded-[4px] text-[12px] font-medium text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
                >
                  {position.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <SectionLabel>Position</SectionLabel>
            <div className="grid grid-cols-3 gap-1 rounded-[6px] border border-[#2a2a2a] bg-[#0a0a0a] p-1">
              {VERTICAL_POSITIONS.map((position) => (
                <button
                  key={position.value}
                  type="button"
                  onClick={() => onPositionText(selectedText.id, { vertical: position.value })}
                  className="h-8 rounded-[4px] text-[12px] font-medium text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
                >
                  {position.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-[#2a2a2a] pt-3">
            <button
              type="button"
              onClick={() => onDuplicateText(selectedText.id)}
              className={BUTTON_CLASS}
            >
              Duplicate
            </button>
            <button type="button" onClick={resetStyle} className={BUTTON_CLASS}>
              Reset style
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
