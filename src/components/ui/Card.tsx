import React from 'react'

type CardVariant = 'default' | 'elevated' | 'upload' | 'brand' | 'error' | 'success'

interface CardProps {
  children: React.ReactNode
  variant?: CardVariant
  className?: string
}

const variantClasses: Record<CardVariant, string> = {
  default:  'bg-white border border-n-200 shadow-sm',
  elevated: 'bg-white shadow-md',
  upload:   'bg-n-50 border-2 border-dashed border-n-300',
  brand:    'bg-brand-50 border border-brand-200',
  error:    'bg-high-50 border border-high-100',
  success:  'bg-low-50 border border-low-100',
}

const Card: React.FC<CardProps> = ({ children, variant = 'default', className = '' }) => (
  <div
    className={[
      'rounded-[14px] p-6',
      variantClasses[variant],
      className,
    ].join(' ')}
  >
    {children}
  </div>
)

export default Card
