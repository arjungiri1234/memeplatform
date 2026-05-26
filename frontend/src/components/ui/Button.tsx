import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-accent text-white',
    'hover:bg-accent-hover',
    'active:bg-accent-hover',
    'focus-visible:ring-accent',
    'disabled:bg-accent/40 disabled:text-white/50',
  ].join(' '),

  secondary: [
    'bg-transparent text-text-primary border border-border',
    'hover:bg-surface-elevated hover:border-border-strong',
    'active:bg-surface-elevated',
    'focus-visible:ring-border-strong',
    'disabled:opacity-40',
  ].join(' '),

  ghost: [
    'bg-transparent text-text-primary',
    'hover:bg-surface-elevated',
    'active:bg-surface-elevated',
    'focus-visible:ring-border-strong',
    'disabled:opacity-40',
  ].join(' '),

  danger: [
    'bg-transparent text-danger border border-transparent',
    'hover:border-danger',
    'active:border-danger',
    'focus-visible:ring-danger',
    'disabled:opacity-40',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          // Base
          'relative inline-flex items-center justify-center gap-2 font-medium',
          'rounded-btn transition-colors duration-120',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'disabled:cursor-not-allowed',
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          // Full width
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? (
          <>
            <Spinner />
            {/* Keep children invisible to preserve button width */}
            <span className="invisible">{children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="sr-only">Loading</span>
            </span>
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button
