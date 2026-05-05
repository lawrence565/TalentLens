import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createAnalytics } from '../../services/analytics'
import ReportRating from './ReportRating'

const forbiddenOutcomeCopy = /interview|callback|offer|hire|hiring outcome/i

describe('ReportRating', () => {
  it('lets users answer whether the report helped them understand what to fix', async () => {
    const track = vi.fn()
    const analytics = createAnalytics({ track })
    const user = userEvent.setup()

    render(<ReportRating reportId="report-1" analytics={analytics} />)

    expect(
      screen.getByRole('heading', { name: /was this report helpful/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/did this help you understand what to fix/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/create an account/i)).not.toBeInTheDocument()
    expect(screen.queryByText(forbiddenOutcomeCopy)).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /yes/i }))
    await user.click(screen.getByRole('button', { name: /submit rating/i }))

    expect(track).toHaveBeenCalledWith({
      name: 'report_helpfulness_rating_submitted',
      payload: {
        reportId: 'report-1',
        rating: 5,
      },
    })
    expect(screen.getByText(/thanks for the feedback/i)).toBeInTheDocument()
  })

  it('sends a lower rating when the report did not clarify next fixes', async () => {
    const track = vi.fn()
    const analytics = createAnalytics({ track })
    const user = userEvent.setup()

    render(<ReportRating reportId="report-1" analytics={analytics} />)

    await user.click(screen.getByRole('radio', { name: /not really/i }))
    await user.click(screen.getByRole('button', { name: /submit rating/i }))

    expect(track).toHaveBeenCalledWith({
      name: 'report_helpfulness_rating_submitted',
      payload: {
        reportId: 'report-1',
        rating: 1,
      },
    })
  })
})
