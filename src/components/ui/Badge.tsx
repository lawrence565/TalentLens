import React from 'react'

type BadgeVariant =
  | 'default' | 'brand' | 'high' | 'medium' | 'low'
  | 'handled' | 'dismissed' | 'pass' | 'warning' | 'fail' | 'accent'

type BadgeSize = 'xs' | 'sm' | 'md'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantClasses: Record<BadgeVariant, string> = {
  default:   'bg-n-100 text-n-700 border-n-200',
  brand:     'bg-brand-50 text-brand-700 border-brand-200',
  high:      'bg-high-50 text-high-700 border-high-100',
  medium:    'bg-med-50 text-med-700 border-med-100',
  low:       'bg-low-50 text-low-700 border-low-100',
  handled:   'bg-low-50 text-low-700 border-low-100',
  dismissed: 'bg-n-100 text-n-500 border-n-200',
  pass:      'bg-low-50 text-low-700 border-low-100',
  warning:   'bg-med-50 text-med-700 border-med-100',
  fail:      'bg-high-50 text-high-700 border-high-100',
  accent:    'bg-accent-50 text-accent-700 border-accent-100',
}

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-[12px]',
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  ...rest
}) => (
  <span
    {...rest}
    className={[
      'inline-flex items-center gap-1 rounded-full border font-semibold leading-none whitespace-nowrap',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(' ')}
  >
    {children}
  </span>
)

export default Badge
