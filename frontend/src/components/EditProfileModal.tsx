import { useCallback, useEffect, useRef, useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useUpload } from '../hooks/useUpload'
import { validateAvatarFile } from '../lib/fileValidation'
import type { Profile } from '../lib/types'
import Button from './ui/Button'
import Input from './ui/Input'

interface EditProfileModalProps {
  profile: Profile
  isOpen: boolean
  onClose: () => void
  onSave: (updated: Profile) => void
}

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

function validateUsername(username: string): string | null {
  if (username.length < 3) return 'Username must be at least 3 characters'
  if (username.length > 20) return 'Username must be 20 characters or fewer'
  if (username.includes(' ')) return 'Username cannot include spaces'
  if (!USERNAME_PATTERN.test(username)) {
    return 'Use letters, numbers, and underscores only'
  }

  return null
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
      />
    </svg>
  )
}

export default function EditProfileModal({
  profile,
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { uploadAvatar } = useUpload()
  const { updateProfile } = useProfile(profile.id)

  const previewUrl = avatarPreview ?? profile.avatar_url

  useEffect(() => {
    if (!isOpen) return

    setUsername(profile.username)
    setAvatarFile(null)
    setAvatarPreview(null)
    setUsernameError(null)
    setAvatarError(null)
    setSaveError(null)
    setSaving(false)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeButtonRef.current?.focus(), 0)

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, profile.username])

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const handleClose = useCallback(() => {
    if (saving) return
    onClose()
  }, [onClose, saving])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) return

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose, isOpen])

  if (!isOpen) return null

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = validateAvatarFile(file)
    if (!validation.valid) {
      setAvatarError(validation.error)
      setAvatarFile(null)
      return
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }

    setAvatarError(null)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextUsername = event.target.value
    setUsername(nextUsername)
    setUsernameError(validateUsername(nextUsername))
  }

  const handleSave = async () => {
    const nextUsername = username.trim()
    const nextUsernameError = validateUsername(nextUsername)

    setUsernameError(nextUsernameError)
    setSaveError(null)

    if (nextUsernameError) return

    setSaving(true)

    try {
      const nextAvatarUrl = avatarFile
        ? await uploadAvatar(profile.id, avatarFile)
        : profile.avatar_url
      const updatedProfile = await updateProfile({
        username: nextUsername,
        avatar_url: nextAvatarUrl,
      })

      if (!updatedProfile) {
        throw new Error('Failed to update profile')
      }

      onSave(updatedProfile)
      onClose()
    } catch (caughtError) {
      setSaveError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to save profile',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="w-full max-w-[480px] rounded-[14px] border border-[#2a2a2a] bg-[#111111] p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2
            id="edit-profile-title"
            className="text-xl font-semibold leading-[1.4] text-[#ededed]"
          >
            Edit profile
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close edit profile"
            onClick={handleClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-[6px] text-[#a1a1a1] transition-colors duration-[120ms] hover:bg-[#1a1a1a] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] active:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#7c3aed] text-[32px] font-medium text-white">
              {getInitials(profile.username)}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
          >
            Change photo
          </Button>
          {avatarError ? (
            <p className="mt-2 text-xs leading-[1.4] text-[#ef4444]" role="alert">
              {avatarError}
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          <Input
            label="Username"
            value={username}
            onChange={handleUsernameChange}
            error={usernameError ?? undefined}
            minLength={3}
            maxLength={20}
            autoComplete="username"
            disabled={saving}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            fullWidth
            disabled={saving || Boolean(usernameError)}
            onClick={handleSave}
          >
            {saving ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>

        {saveError ? (
          <p className="mt-4 text-center text-sm leading-[1.5] text-[#ef4444]" role="alert">
            {saveError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
