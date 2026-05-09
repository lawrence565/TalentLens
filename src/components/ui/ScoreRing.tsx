import React, { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
  size?: number
  animate?: boolean
}

const getColorClass = (s: number) =>
  s >= 85 ? 'text-low-500' : s >= 65 ? 'text-brand-500' : 'text-med-500'

const getStrokeColor = (s: number) =>
  s >= 85
    ? 'oklch(0.622 0.150 158)'
    : s >= 65
    ? 'oklch(0.508 0.200 265)'
    : 'oklch(0.715 0.158 72)'

const getLabel = (s: number) =>
  s >= 85 ? 'Strong Foundation' : s >= 65 ? 'Focused Work Needed' : 'High-Priority Review'

const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 160, animate = true }) => {
  const [displayed, setDisplayed] = useState(animate ? 0 : score)
  const strokeWidth = size * 0.075
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * (displayed / 100)

  useEffect(() => {
    if (!animate) {
      setDisplayed(score)
      return
    }
    let start: number | null = null
    const duration = 1200
    const step = (ts: number) => {
      if (start === null) start = ts
      const t = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(ease * score))
      if (t < 1) requestAnimationFrame(step)
    }
    const id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [score, animate])

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="oklch(0.916 0.010 80)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={getStrokeColor(displayed)}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.05s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            data-testid="score-value"
            className="font-mono font-medium leading-none text-n-900"
            style={{ fontSize: size * 0.24 }}
          >
            {displayed}
          </span>
          <span
            className="font-sans font-semibold uppercase tracking-wider text-n-400"
            style={{ fontSize: size * 0.08 }}
          >
            Score
          </span>
        </div>
      </div>
      <span className={`font-sans text-sm font-semibold ${getColorClass(score)}`}>
        {getLabel(score)}
      </span>
    </div>
  )
}

export default ScoreRing
