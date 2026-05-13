import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Progress from './Progress'

describe('Progress', () => {
  it('renders a progressbar with correct aria attributes', () => {
    render(<Progress value={40} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('shows label and percentage when label prop is provided', () => {
    render(<Progress value={62} label="Uploading" />)
    expect(screen.getByText('Uploading')).toBeInTheDocument()
    expect(screen.getByText('62%')).toBeInTheDocument()
  })

  it('does not show percentage text when label is omitted', () => {
    render(<Progress value={62} />)
    expect(screen.queryByText('62%')).not.toBeInTheDocument()
  })

  it('renders each variant without errors', () => {
    const variants = ['brand', 'success', 'warning', 'error'] as const
    for (const variant of variants) {
      const { unmount } = render(<Progress value={50} variant={variant} />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      unmount()
    }
  })
})
