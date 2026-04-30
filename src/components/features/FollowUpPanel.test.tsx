import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createAnalytics } from '../../services/analytics'
import type { DiagnosisReport, FollowUpResponse } from '../../types'
import FollowUpPanel from './FollowUpPanel'

type FollowUpPanelResponse = FollowUpResponse & {
  rewriteExamples?: string[]
}

const report: DiagnosisReport = {
  id: 'report-1',
  resumeId: 'resume-1',
  analysisId: 'analysis-1',
  overallScore: 72,
  summary: 'Focus the resume on clearer impact, structure, and ATS readability.',
  issues: [
    {
      id: 'issue-1',
      title: 'Lead with measurable impact',
      severity: 'high',
      category: 'content_clarity',
      reason: 'The strongest bullets describe duties without measurable results.',
      nextAction: 'Rewrite the top bullets to include scope, metrics, and outcomes.',
      status: 'open',
      priority: 1,
    },
    {
      id: 'issue-2',
      title: 'Simplify formatting',
      severity: 'medium',
      category: 'formatting',
      reason: 'Columns may reduce parser reliability.',
      nextAction: 'Move content into a single-column layout.',
      status: 'open',
      priority: 2,
    },
  ],
  atsChecks: [],
  followUpPrompts: ['How should I rewrite the first bullet?'],
  createdAt: '2026-04-30T10:00:00.000Z',
}

const responseWithGuidance: FollowUpPanelResponse = {
  id: 'follow-up-1',
  reportId: 'report-1',
  issueId: 'issue-1',
  answer: 'Start with the result, then add scope and the action you took.',
  rewriteExamples: [
    'Increased qualified leads 24% by rebuilding the onboarding email sequence.',
  ],
  nextActions: [
    'Revise one bullet for measurable impact.',
    'Check that the metric is accurate.',
  ],
  createdAt: '2026-04-30T10:01:00.000Z',
}

describe('FollowUpPanel', () => {
  it('asks about a specific issue, shows loading, then renders answer, examples, and next actions', async () => {
    const user = userEvent.setup()
    let resolveFollowUp: (response: FollowUpPanelResponse) => void
    const followUpPromise = new Promise<FollowUpPanelResponse>((resolve) => {
      resolveFollowUp = resolve
    })
    const askFollowUp = vi.fn(() => followUpPromise)

    render(
      <FollowUpPanel
        report={report}
        followUpResponse={null}
        askFollowUp={askFollowUp}
      />,
    )

    const submitButton = screen.getByRole('button', { name: /ask follow-up/i })
    expect(submitButton).toBeDisabled()

    await user.selectOptions(screen.getByLabelText(/issue/i), 'issue-1')
    await user.type(
      screen.getByLabelText(/question/i),
      'How should I rewrite the first bullet?',
    )
    await user.click(submitButton)

    expect(screen.getByRole('button', { name: /asking/i })).toBeDisabled()
    expect(askFollowUp).toHaveBeenCalledWith({
      issueId: 'issue-1',
      question: 'How should I rewrite the first bullet?',
    })

    resolveFollowUp!(responseWithGuidance)

    expect(await screen.findByText(responseWithGuidance.answer)).toBeInTheDocument()
    expect(screen.getByText(responseWithGuidance.rewriteExamples![0])).toBeInTheDocument()
    expect(screen.getByText(responseWithGuidance.nextActions[0])).toBeInTheDocument()
  })

  it('hides rewrite examples and next actions when the response omits them', () => {
    render(
      <FollowUpPanel
        report={report}
        followUpResponse={{
          id: 'follow-up-2',
          reportId: 'report-1',
          issueId: 'issue-2',
          answer: 'Keep the section direct and easy to scan.',
          nextActions: [],
          createdAt: '2026-04-30T10:02:00.000Z',
        }}
        askFollowUp={vi.fn()}
      />,
    )

    expect(screen.getByText(/keep the section direct/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /rewrite examples/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /next actions/i })).not.toBeInTheDocument()
  })

  it('shows a clear retryable error when follow-up fails', async () => {
    const user = userEvent.setup()
    const askFollowUp = vi.fn(async () => {
      throw new Error('Network failed')
    })

    render(
      <FollowUpPanel
        report={report}
        followUpResponse={null}
        askFollowUp={askFollowUp}
      />,
    )

    await user.type(screen.getByLabelText(/question/i), 'What should I do first?')
    await user.click(screen.getByRole('button', { name: /ask follow-up/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /follow-up failed\. please try again/i,
      )
    })
    expect(screen.getByRole('button', { name: /try again/i })).toBeEnabled()
  })

  it('fires followUpAsked analytics when a question is submitted', async () => {
    const user = userEvent.setup()
    const track = vi.fn()
    const analytics = createAnalytics({ track })
    const askFollowUp = vi.fn().mockResolvedValue(responseWithGuidance)

    render(
      <FollowUpPanel
        report={report}
        followUpResponse={null}
        askFollowUp={askFollowUp}
        analytics={analytics}
      />,
    )

    await user.selectOptions(screen.getByLabelText(/issue/i), 'issue-1')
    await user.type(screen.getByLabelText(/question/i), 'How do I start?')
    await user.click(screen.getByRole('button', { name: /ask follow-up/i }))

    expect(await screen.findByText(responseWithGuidance.answer)).toBeInTheDocument()
    expect(track).toHaveBeenCalledWith({
      name: 'follow_up_asked',
      payload: {
        reportId: 'report-1',
        issueId: 'issue-1',
        questionLength: 'How do I start?'.length,
      },
    })
  })
})
