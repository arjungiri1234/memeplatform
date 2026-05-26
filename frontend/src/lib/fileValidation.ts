export interface ValidationResult {
  valid: boolean
  error: string | null
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MEME_MAX_SIZE_BYTES = 5 * 1024 * 1024
const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024
const BYTES_PER_KB = 1024
const BYTES_PER_MB = 1024 * 1024

type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

function isAllowedImageType(type: string): type is AllowedImageType {
  return ALLOWED_IMAGE_TYPES.includes(type as AllowedImageType)
}

function validateFile(file: File, maxSizeBytes: number, label: string): ValidationResult {
  if (!isAllowedImageType(file.type)) {
    return {
      valid: false,
      error: 'File must be a JPEG, PNG, or WebP image.',
    }
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `${label} image must be under ${getFileSizeString(maxSizeBytes)}.`,
    }
  }

  return {
    valid: true,
    error: null,
  }
}

export function validateImageFile(file: File): ValidationResult {
  return validateMemeFile(file)
}

export function validateMemeFile(file: File): ValidationResult {
  return validateFile(file, MEME_MAX_SIZE_BYTES, 'Meme')
}

export function validateAvatarFile(file: File): ValidationResult {
  return validateFile(file, AVATAR_MAX_SIZE_BYTES, 'Avatar')
}

export function getFileSizeString(bytes: number): string {
  if (bytes >= BYTES_PER_MB) {
    return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`
  }

  return `${Math.round(bytes / BYTES_PER_KB)} KB`
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).slice(2, 10)
  const sanitizedName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${timestamp}-${randomId}-${sanitizedName}`
}
