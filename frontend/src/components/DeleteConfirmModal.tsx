import { useEffect, useRef } from 'react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  deleting?: boolean
  title?: string
  description?: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteConfirmModal({
  isOpen,
  deleting = false,
  title = 'Delete meme',
  description = 'Are you sure you want to delete this meme? This action cannot be undone.',
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => cancelButtonRef.current?.focus(), 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-description"
        className="w-full max-w-[420px] rounded-[14px] border border-[#2a2a2a] bg-[#111111] p-6"
      >
        <h2
          id="delete-confirm-title"
          className="text-lg font-semibold leading-[1.5] text-[#ededed]"
        >
          {title}
        </h2>
        <p
          id="delete-confirm-description"
          className="mt-2 max-w-sm text-sm leading-[1.6] text-[#a1a1a1]"
        >
          {description}
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex h-9 min-w-24 items-center justify-center rounded-[6px] border border-[#2a2a2a] bg-transparent px-4 text-sm font-medium text-[#ededed] transition-colors duration-[120ms] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-9 min-w-32 items-center justify-center gap-2 rounded-[6px] bg-[#ef4444] px-4 text-sm font-medium text-white transition-colors duration-[120ms] hover:bg-[#dc2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] active:bg-[#b91c1c] disabled:cursor-not-allowed disabled:bg-[#ef4444]/40 disabled:text-white/60"
          >
            {deleting ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent"
                aria-hidden="true"
              />
            ) : null}
            {deleting ? 'Deleting...' : 'Delete meme'}
          </button>
        </div>
      </section>
    </div>
  )
}
