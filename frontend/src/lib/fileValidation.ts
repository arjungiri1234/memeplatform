export interface ValidationResult {
  valid: boolean
  error: string | null
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MEME_MAX_SIZE = 5 * 1024 * 1024

export function validateMemeFile(file: File): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return {
      valid: false,
      error: 'Use a JPG, PNG, or WEBP image',
    }
  }

  if (file.size > MEME_MAX_SIZE) {
    return {
      valid: false,
      error: 'Image must be under 5MB',
    }
  }

  return {
    valid: true,
    error: null,
  }
}
