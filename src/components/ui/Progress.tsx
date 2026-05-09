import React from 'react'

type ProgressVariant = 'brand' | 'success' | 'warning' | 'error'

interface ProgressProps {
  value: number
  variant?: ProgressVariant
  label?: string
  ariaLabel?: string
}

const fillClass: Record<ProgressVariant, string> = {
  brand:   'bg-brand-500',
  success: 'bg-low-500',
  warning: 'bg-med-500',
  error:   'bg-high-500',
}

const Progress: React.FC<ProgressProps> = ({ value, variant = 'brand', label, ariaLabel }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <div className="flex justify-between items-center">
        <span className="font-sans text-xs text-n-600">{label}</span>
        <span className="font-mono text-xs text-n-500 font-medium">{value}%</span>
      </div>
    )}
    <div className="h-1.5 rounded-full bg-n-200 overflow-hidden">
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className={`h-full rounded-full transition-all duration-500 ${fillClass[variant]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
)

export default Progress
