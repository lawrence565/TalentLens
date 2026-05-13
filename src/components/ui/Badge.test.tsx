import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Badge from './Badge'
import SeverityDot from './SeverityDot'

describe('SeverityDot', () => {
  it('renders a dot for each severity level', () => {
    const { rerender } = render(<SeverityDot level="high" />)
    expect(document.querySelector('[data-severity="high"]')).toBeInTheDocument()

    rerender(<SeverityDot level="medium" />)
    expect(document.querySelector('[data-severity="medium"]')).toBeInTheDocument()

    rerender(<SeverityDot level="low" />)
    expect(document.querySelector('[data-severity="low"]')).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>High Priority</Badge>)
    expect(screen.getByText('High Priority')).toBeInTheDocument()
  })

  it('renders all severity variants without errors', () => {
    const variants = ['default', 'brand', 'high', 'medium', 'low', 'handled', 'dismissed', 'pass', 'warning', 'fail', 'accent'] as const
    for (const variant of variants) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>)
      expect(screen.getByText(variant)).toBeInTheDocument()
      unmount()
    }
  })

  it('renders xs, sm, and md sizes', () => {
    const { rerender } = render(<Badge size="xs">label</Badge>)
    expect(screen.getByText('label')).toBeInTheDocument()
    rerender(<Badge size="sm">label</Badge>)
    expect(screen.getByText('label')).toBeInTheDocument()
    rerender(<Badge size="md">label</Badge>)
    expect(screen.getByText('label')).toBeInTheDocument()
  })
})
