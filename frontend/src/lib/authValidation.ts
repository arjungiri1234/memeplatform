const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/
const PASSWORD_SPECIAL_CHARACTERS = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~"

export function validateEmail(email: string): string | null {
  if (!EMAIL_PATTERN.test(email.trim())) {
    return 'Enter a valid email address'
  }

  return null
}

export function validatePassword(password: string): string | null {
  const hasSpecialCharacter = Array.from(PASSWORD_SPECIAL_CHARACTERS).some(
    (character) => password.includes(character),
  )

  if (
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !hasSpecialCharacter
  ) {
    return 'Use at least 8 characters with uppercase, lowercase, a number, and a special character'
  }

  return null
}

export function validateUsername(username: string): string | null {
  if (username.length < 3) {
    return 'Username must be at least 3 characters'
  }

  if (username.includes(' ') || !USERNAME_PATTERN.test(username)) {
    return 'Use letters, numbers, and underscores only'
  }

  return null
}
