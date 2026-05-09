import React from 'react'
import type { ButtonProps } from '../../types'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-md hover:-translate-y-px',
  secondary: 'bg-n-100 text-n-800 hover:bg-n-200',
  outline:   'border-[1.5px] border-n-300 bg-white text-n-700 hover:bg-n-50',
  ghost:     'bg-transparent text-n-600 hover:bg-n-100',
  danger:    'bg-high-500 text-white hover:bg-high-700',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'px-2.5 py-1 text-[11px]',
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

const Spinner: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ animation: 'tl-spin 0.8s linear infinite' }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeDasharray="31.4"
      strokeDashoffset="10"
      strokeLinecap="round"
    />
  </svg>
)

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={[
      'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(' ')}
  >
    {loading ? (
      <>
        <Spinner />
        {children}
      </>
    ) : (
      children
    )}
  </button>
)

export default Button
