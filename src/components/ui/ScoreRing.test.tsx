import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ScoreRing from './ScoreRing'

describe('ScoreRing', () => {
  it('renders the score value', () => {
    render(<ScoreRing score={72} animate={false} />)
    expect(screen.getByTestId('score-value')).toHaveTextContent('72')
  })

  it('shows "Score" label', () => {
    render(<ScoreRing score={72} animate={false} />)
    expect(screen.getByText(/score/i)).toBeInTheDocument()
  })

  it('shows "Focused Work Needed" for mid-range score', () => {
    render(<ScoreRing score={72} animate={false} />)
    expect(screen.getByText('Focused Work Needed')).toBeInTheDocument()
  })

  it('shows "Strong Foundation" for high score', () => {
    render(<ScoreRing score={88} animate={false} />)
    expect(screen.getByText('Strong Foundation')).toBeInTheDocument()
  })

  it('shows "High-Priority Review" for low score', () => {
    render(<ScoreRing score={42} animate={false} />)
    expect(screen.getByText('High-Priority Review')).toBeInTheDocument()
  })

  it('renders an SVG ring', () => {
    render(<ScoreRing score={72} animate={false} />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})
