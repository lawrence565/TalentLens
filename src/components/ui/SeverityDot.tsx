import React from 'react'

interface SeverityDotProps {
  level: 'high' | 'medium' | 'low'
}

const colorClass: Record<SeverityDotProps['level'], string> = {
  high: 'bg-high-500',
  medium: 'bg-med-500',
  low: 'bg-low-500',
}

const SeverityDot: React.FC<SeverityDotProps> = ({ level }) => (
  <span
    data-severity={level}
    className={`inline-block h-[7px] w-[7px] shrink-0 rounded-full ${colorClass[level]}`}
  />
)

export default SeverityDot
