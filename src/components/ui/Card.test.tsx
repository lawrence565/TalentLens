import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Card from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders all 6 variants without errors', () => {
    const variants = ['default', 'elevated', 'upload', 'brand', 'error', 'success'] as const
    for (const variant of variants) {
      const { unmount } = render(<Card variant={variant}>content</Card>)
      expect(screen.getByText('content')).toBeInTheDocument()
      unmount()
    }
  })

  it('merges additional className', () => {
    const { container } = render(<Card className="custom-class">content</Card>)
    const card = container.querySelector('div')
    expect(card?.getAttribute('class')).toContain('custom-class')
  })
})
