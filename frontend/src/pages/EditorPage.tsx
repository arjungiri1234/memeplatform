import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import EditorToolbar from '../components/EditorToolbar'
import MemeEditor from '../components/MemeEditor'
import type { MemeEditorHandle, TextObject } from '../components/MemeEditor'
import StickerPanel from '../components/StickerPanel'
import { useMemeGeneration } from '../hooks/useMemeGeneration'
import { usePublish } from '../hooks/usePublish'
import { ROUTES } from '../lib/constants'
import { validateMemeFile } from '../lib/fileValidation'

type EditorTab = 'create' | 'upload'

const BACKGROUND_COLORS = [
  { label: 'Black', value: '#000000', className: 'bg-[#000000]' },
  { label: 'White', value: '#ffffff', className: 'bg-[#ffffff]' },
  { label: 'Dark', value: '#1a1a2e', className: 'bg-[#1a1a2e]' },
  { label: 'Red', value: '#7f1d1d', className: 'bg-[#7f1d1d]' },
  { label: 'Green', value: '#14532d', className: 'bg-[#14532d]' },
  { label: 'Blue', value: '#1e3a5f', className: 'bg-[#1e3a5f]' },
  { label: 'Purple', value: '#3b0764', className: 'bg-[#3b0764]' },
] as const

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ne', label: 'नेपाली' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
] as const

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

function UploadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5" />
    </svg>
  )
}

function TabButton({
  tab,
  activeTab,
  children,
  onClick,
}: {
  tab: EditorTab
  activeTab: EditorTab
  children: string
  onClick: (tab: EditorTab) => void
}) {
  const isActive = activeTab === tab

  return (
    <button
      type="button"
      onClick={() => onClick(tab)}
      className={[
        'h-9 flex-1 rounded-[6px] text-[13px] font-medium transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]',
        isActive
          ? 'bg-[#1e1030] text-[#7c3aed]'
          : 'text-[#555555] hover:bg-[#1a1a1a] hover:text-[#ededed]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="text-[13px] font-medium leading-[1.5] text-[#ededed]">
      {children}
    </label>
  )
}

function CreateTabContent({
  prompt,
  language,
  captions,
  generating,
  error,
  onPromptChange,
  onLanguageChange,
  onGenerate,
  onCaptionSelect,
}: {
  prompt: string
  language: string
  captions: string[]
  generating: boolean
  error: string | null
  onPromptChange: (prompt: string) => void
  onLanguageChange: (language: string) => void
  onGenerate: () => void
  onCaptionSelect: (caption: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FieldLabel>Describe your meme</FieldLabel>
        <textarea
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder={`Type in any language...
नेपाली, हिन्दी, Русский, 中文, English`}
          className="h-[100px] w-full resize-none rounded-[6px] border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm leading-[1.5] text-[#ededed] outline-none transition-colors duration-[120ms] placeholder:text-[#555555] hover:border-[#3a3a3a] focus:border-[#7c3aed]"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel>Language</FieldLabel>
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="h-9 w-full rounded-[6px] border border-[#2a2a2a] bg-[#111111] px-3 text-sm text-[#ededed] outline-none transition-colors duration-[120ms] hover:border-[#3a3a3a] focus:border-[#7c3aed]"
        >
          {LANGUAGE_OPTIONS.map((language) => (
            <option key={language.value} value={language.value}>
              {language.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={generating}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-[#7c3aed] px-4 text-sm font-medium text-white transition-colors duration-[120ms] hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {generating ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
            aria-hidden="true"
          />
        ) : null}
        {generating ? 'Generating...' : 'Generate meme ✨'}
      </button>

      {error ? (
        <p className="text-[13px] leading-[1.5] text-[#ef4444]">{error}</p>
      ) : null}

      <div className="h-px bg-[#2a2a2a]" />

      <section className="space-y-3">
        <h2 className="text-[13px] font-medium leading-[1.5] text-[#ededed]">
          Choose a caption
        </h2>
        {captions.length > 0 ? (
          <div className="space-y-2">
            {captions.map((caption) => (
              <button
                key={caption}
                type="button"
                onClick={() => onCaptionSelect(caption)}
                className="min-h-10 w-full rounded-[6px] border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-left text-[13px] font-medium leading-[1.5] text-[#ededed] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
              >
                {caption}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-10 rounded-[6px] border border-[#2a2a2a] bg-[#1a1a1a]"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function UploadTabContent({
  fileName,
  error,
  onBrowse,
  onFileSelect,
  onCancel,
}: {
  fileName: string | null
  error: string | null
  onBrowse: () => void
  onFileSelect: (file: File) => void
  onCancel: () => void
}) {
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]

    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={onBrowse}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onBrowse()
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="group flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-[#2a2a2a] bg-[#0a0a0a] px-4 text-center transition-colors duration-[120ms] hover:border-[#7c3aed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]"
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#2a2a2a] bg-[#111111] text-[#a1a1a1] transition-colors duration-[120ms] group-hover:border-[#7c3aed] group-hover:text-[#ededed]">
          <UploadIcon />
        </div>
        <p className="text-[15px] font-medium leading-[1.6] text-[#ededed]">
          Drop image here
        </p>
        <p className="mt-1 text-[13px] leading-[1.5] text-[#a1a1a1]">
          JPG, PNG, WEBP up to 5MB
        </p>
        {fileName ? (
          <p className="mt-3 max-w-full truncate text-[13px] font-medium leading-[1.5] text-[#ededed]">
            {fileName}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-[13px] leading-[1.5] text-[#ef4444]">{error}</p>
      ) : null}

      {fileName ? (
        <button
          type="button"
          onClick={onCancel}
          className="h-10 w-full rounded-[6px] border border-[#ef4444]/40 bg-transparent px-4 text-sm font-medium text-[#ef4444] transition-colors duration-[120ms] hover:border-[#ef4444] hover:bg-[#ef4444]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] active:bg-[#ef4444]/10"
        >
          Remove image
        </button>
      ) : (
        <>
          <div className="text-center text-[13px] leading-[1.5] text-[#555555]">
            Or
          </div>
          <button
            type="button"
            onClick={onBrowse}
            className="h-10 w-full rounded-[6px] border border-[#2a2a2a] bg-transparent px-4 text-sm font-medium text-[#ededed] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
          >
            Browse files
          </button>
        </>
      )}
    </div>
  )
}

function BackgroundPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <section className="space-y-3 rounded-[10px] border border-[#2a2a2a] bg-[#111111] p-4">
      <h2 className="text-[13px] font-medium leading-[1.5] text-[#ededed]">
        Background
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {BACKGROUND_COLORS.map((color) => {
          const isActive = value.toLowerCase() === color.value

          return (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(color.value)}
              aria-label={`Set background ${color.label}`}
              className={[
                'h-8 w-8 rounded-full border border-[#2a2a2a] transition duration-[120ms] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]',
                color.className,
                isActive ? 'ring-2 ring-[#7c3aed] ring-offset-2 ring-offset-[#111111]' : '',
              ].join(' ')}
            />
          )
        })}
        <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#2a2a2a] bg-[#1a1a1a] transition duration-[120ms] hover:scale-110 focus-within:ring-2 focus-within:ring-[#7c3aed]">
          <span className="text-[11px] font-medium text-[#a1a1a1]">+</span>
          <input
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label="Choose custom background color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </section>
  )
}

export default function EditorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    generating,
    error: generateError,
    generate,
    reset: resetGeneration,
  } = useMemeGeneration()
  const {
    publishing,
    published,
    error: publishError,
    publish,
    reset: resetPublish,
  } = usePublish()
  const [templateId] = useState<string | null>(() => searchParams.get('templateId'))
  const [activeTab, setActiveTab] = useState<EditorTab>(
    () => (searchParams.get('mode') === 'upload' ? 'upload' : 'create'),
  )
  const [selectedText, setSelectedText] = useState<TextObject | null>(null)
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    () => searchParams.get('imageUrl'),
  )
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('en')
  const [prompt, setPrompt] = useState('')
  const [captions, setCaptions] = useState<string[]>([])
  const editorRef = useRef<MemeEditorHandle | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (backgroundImageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(backgroundImageUrl)
      }
    }
  }, [backgroundImageUrl])

  const handleAddText = useCallback(() => {
    editorRef.current?.addText('Text')
  }, [])

  const handleTextChange = useCallback((
    id: string,
    changes: Partial<TextObject>,
  ) => {
    editorRef.current?.updateText(id, changes)
    setSelectedText((currentText) =>
      currentText?.id === id ? { ...currentText, ...changes } : currentText,
    )
  }, [])

  const handleDeleteText = useCallback((id: string) => {
    editorRef.current?.deleteText(id)
    setSelectedText(null)
  }, [])

  const handleExport = useCallback((_dataUrl: string) => {
    // Export is pulled directly from the ref when publishing.
  }, [])

  const handleBrowse = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleCancelUpload = useCallback(() => {
    setBackgroundImageUrl((currentUrl) => {
      if (currentUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl)
      }

      return null
    })
    setUploadedFileName(null)
    setUploadError(null)
    resetPublish()
  }, [resetPublish])

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateMemeFile(file)

    if (!validation.valid) {
      setUploadError(validation.error)
      return
    }

    setUploadError(null)
    resetPublish()
    setUploadedFileName(file.name)
    setBackgroundImageUrl((currentUrl) => {
      if (currentUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl)
      }

      return URL.createObjectURL(file)
    })
  }, [resetPublish])

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      handleFileSelect(file)
    }

    event.target.value = ''
  }, [handleFileSelect])

  const handleStickerSelect = useCallback((emoji: string) => {
    editorRef.current?.addSticker(emoji)
  }, [])

  const handleCaptionSelect = useCallback((caption: string) => {
    editorRef.current?.addText(caption)
  }, [])

  const handleGenerate = useCallback(async () => {
    resetPublish()
    const result = await generate({
      userPrompt: prompt,
      language,
    })

    if (result) {
      setBackgroundImageUrl((currentUrl) => {
        if (currentUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(currentUrl)
        }

        return result.imageUrl
      })
      setUploadedFileName(null)
      setCaptions(result.captions.slice(0, 3))
    }
  }, [generate, language, prompt, resetPublish])

  const handlePublish = useCallback(async () => {
    const dataUrl = editorRef.current?.exportCanvas()

    if (!dataUrl) {
      return
    }

    await publish({
      canvasDataUrl: dataUrl,
      title: title.trim() || null,
      language,
      templateId: templateId ?? undefined,
    })
  }, [language, publish, title])

  const handleViewFeed = useCallback(() => {
    navigate(ROUTES.FEED)
  }, [navigate])

  const handleCreateAnother = useCallback(() => {
    resetPublish()
    editorRef.current?.clearTexts()
    setSelectedText(null)
    setBackgroundColor('#000000')
    setBackgroundImageUrl((currentUrl) => {
      if (currentUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl)
      }

      return null
    })
    setUploadedFileName(null)
    setUploadError(null)
    setTitle('')
    setPrompt('')
    setCaptions([])
    resetGeneration()
    setActiveTab('create')
  }, [resetGeneration, resetPublish])

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0a0a0a] px-4 py-6 text-[#ededed] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleInputChange}
        />
        <header className="flex h-10 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.CREATE}
              aria-label="Back to templates"
              className="flex h-10 w-10 items-center justify-center rounded-[6px] text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
            >
              <BackIcon />
            </Link>
            <h1 className="text-xl font-semibold leading-[1.4] text-[#ededed]">
              Create meme
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
          <section className="overflow-hidden rounded-[10px] bg-[#000000]">
            <EditorToolbar
              selectedText={selectedText}
              onTextChange={handleTextChange}
              onAddText={handleAddText}
              onDeleteText={handleDeleteText}
            />
            <div className="flex min-h-[500px] items-center justify-center">
              <MemeEditor
                ref={editorRef}
                backgroundImage={backgroundImageUrl}
                backgroundColor={backgroundColor}
                onExport={handleExport}
                onSelectionChange={setSelectedText}
              />
            </div>
          </section>

          <aside className="rounded-[10px] border border-[#2a2a2a] bg-[#111111] p-4">
            <div className="flex rounded-[6px] border border-[#2a2a2a] bg-[#0a0a0a] p-1">
              <TabButton tab="create" activeTab={activeTab} onClick={setActiveTab}>
                Create
              </TabButton>
              <TabButton tab="upload" activeTab={activeTab} onClick={setActiveTab}>
                Upload
              </TabButton>
            </div>

            <div className="mt-4">
              <div className="mb-4 space-y-4">
                <BackgroundPicker
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                />
                <StickerPanel onStickerSelect={handleStickerSelect} />
              </div>

              {activeTab === 'create' ? (
                <CreateTabContent
                  prompt={prompt}
                  language={language}
                  captions={captions}
                  generating={generating}
                  error={generateError}
                  onPromptChange={setPrompt}
                  onLanguageChange={setLanguage}
                  onGenerate={handleGenerate}
                  onCaptionSelect={handleCaptionSelect}
                />
              ) : (
                <UploadTabContent
                  fileName={uploadedFileName}
                  error={uploadError}
                  onBrowse={handleBrowse}
                  onFileSelect={handleFileSelect}
                  onCancel={handleCancelUpload}
                />
              )}
            </div>


            {published ? (
              <div className="mt-6 border-t border-[#2a2a2a] pt-4">
                <div className="rounded-[10px] border border-[#2a2a2a] bg-[#0a0a0a] p-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#22c55e] text-2xl text-[#22c55e]">
                    ✓
                  </div>
                  <h2 className="mt-3 text-[15px] font-medium leading-[1.6] text-[#ededed]">
                    Your meme is live!
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleViewFeed}
                      className="h-10 rounded-[6px] bg-[#7c3aed] px-4 text-sm font-medium text-white transition-colors duration-[120ms] hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#6d28d9]"
                    >
                      View in feed
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateAnother}
                      className="h-10 rounded-[6px] border border-[#2a2a2a] bg-transparent px-4 text-sm font-medium text-[#ededed] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a]"
                    >
                      Create another
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 border-t border-[#2a2a2a] pt-4">
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value.slice(0, 100))}
                  maxLength={100}
                  placeholder="Add a title (optional)"
                  className="mb-3 h-10 w-full rounded-[6px] border border-[#2a2a2a] bg-[#111111] px-3 text-sm text-[#ededed] outline-none transition-colors duration-[120ms] placeholder:text-[#555555] hover:border-[#3a3a3a] focus:border-[#7c3aed]"
                />
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-[#7c3aed] px-4 text-sm font-medium text-white transition-colors duration-[120ms] hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishing ? (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
                      aria-hidden="true"
                    />
                  ) : null}
                  {publishing ? 'Publishing...' : 'Publish meme 🚀'}
                </button>
                {publishError ? (
                  <p className="mt-2 text-[13px] leading-[1.5] text-[#ef4444]">
                    {publishError}
                  </p>
                ) : null}
                <p className="mt-2 text-center text-[13px] leading-[1.5] text-[#a1a1a1]">
                  Exports and saves to your profile
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
