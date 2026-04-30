import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { createAnalytics } from '../../services/analytics'
import type { DiagnosisIssue, DiagnosisReport, IssueStatus } from '../../types'
import SuggestionsSection from './SuggestionsSection'

const baseReport: DiagnosisReport = {
  id: 'report-1',
  resumeId: 'resume-1',
  analysisId: 'analysis-1',
  overallScore: 74,
  summary:
    'The resume has useful experience, but the strongest proof points need clearer impact and ATS-safe formatting.',
  issues: [
    {
      id: 'issue-impact',
      title: 'Lead with measurable impact',
      severity: 'high',
      category: 'content_clarity',
      reason: 'Several bullets list responsibilities without measurable outcomes.',
      nextAction: 'Rewrite the top bullets to include scope, metrics, and business value.',
      status: 'open',
      priority: 1,
    },
    {
      id: 'issue-formatting',
      title: 'Simplify formatting for ATS parsing',
      severity: 'medium',
      category: 'formatting',
      reason: 'Dense columns can make work history harder to parse.',
      nextAction: 'Use single-column sections and standard headings.',
      status: 'open',
      priority: 2,
    },
  ],
  atsChecks: [],
  followUpPrompts: [],
  createdAt: '2026-04-30T10:00:00.000Z',
}

interface HarnessProps {
  updateIssueStatus: (issueId: string, status: IssueStatus) => void | Promise<DiagnosisIssue>
  analytics?: ReturnType<typeof createAnalytics>
}

const SuggestionsHarness = ({ updateIssueStatus, analytics }: HarnessProps) => {
  const [report, setReport] = useState(baseReport)

  const handleUpdateIssueStatus = async (
    issueId: string,
    status: IssueStatus,
  ): Promise<DiagnosisIssue> => {
    const updatedIssue = await updateIssueStatus(issueId, status)
    const fallbackIssue = report.issues.find((issue) => issue.id === issueId)

    if (!updatedIssue && !fallbackIssue) {
      throw new Error('Issue not found.')
    }

    const nextIssue = updatedIssue || { ...fallbackIssue!, status }

    setReport((currentReport) => ({
      ...currentReport,
      issues: currentReport.issues.map((issue) =>
        issue.id === issueId ? nextIssue : issue,
      ),
    }))

    return nextIssue
  }

  return (
    <SuggestionsSection
      report={report}
      updateIssueStatus={handleUpdateIssueStatus}
      analytics={analytics}
    />
  )
}

describe('SuggestionsSection', () => {
  it('marks an issue handled and keeps the report context visible', async () => {
    const user = userEvent.setup()
    const updateIssueStatus = vi.fn()

    render(<SuggestionsHarness updateIssueStatus={updateIssueStatus} />)

    const issue = screen.getByRole('article', {
      name: /lead with measurable impact/i,
    })

    await user.click(within(issue).getByRole('button', { name: /mark handled/i }))

    expect(updateIssueStatus).toHaveBeenCalledWith('issue-impact', 'handled')
    expect(issue).toHaveTextContent(/status:\s*handled/i)
    expect(screen.getByText(baseReport.summary)).toBeInTheDocument()
    expect(issue).toHaveTextContent(baseReport.issues[0].reason)
    expect(issue).toHaveTextContent(baseReport.issues[0].nextAction)
  })

  it('marks an issue dismissed and keeps the report context visible', async () => {
    const user = userEvent.setup()
    const updateIssueStatus = vi.fn()

    render(<SuggestionsHarness updateIssueStatus={updateIssueStatus} />)

    const issue = screen.getByRole('article', {
      name: /simplify formatting for ats parsing/i,
    })

    await user.click(within(issue).getByRole('button', { name: /dismiss issue/i }))

    expect(updateIssueStatus).toHaveBeenCalledWith('issue-formatting', 'dismissed')
    expect(issue).toHaveTextContent(/status:\s*dismissed/i)
    expect(screen.getByText(baseReport.summary)).toBeInTheDocument()
    expect(issue).toHaveTextContent(baseReport.issues[1].reason)
    expect(issue).toHaveTextContent(baseReport.issues[1].nextAction)
  })

  it('disables issue action buttons while an async status update is pending', async () => {
    const user = userEvent.setup()
    let resolveUpdate: (issue: DiagnosisIssue) => void = () => {}
    const updateIssueStatus = vi.fn(
      () =>
        new Promise<DiagnosisIssue>((resolve) => {
          resolveUpdate = resolve
        }),
    )

    render(<SuggestionsHarness updateIssueStatus={updateIssueStatus} />)

    const issue = screen.getByRole('article', {
      name: /lead with measurable impact/i,
    })
    const handledButton = within(issue).getByRole('button', { name: /mark handled/i })
    const dismissedButton = within(issue).getByRole('button', { name: /dismiss issue/i })

    await user.click(handledButton)

    expect(handledButton).toBeDisabled()
    expect(dismissedButton).toBeDisabled()

    resolveUpdate({ ...baseReport.issues[0], status: 'handled' })

    expect(await within(issue).findByText(/status:\s*handled/i)).toBeInTheDocument()
    expect(handledButton).not.toBeDisabled()
    expect(dismissedButton).not.toBeDisabled()
  })

  it('shows accessible failure feedback when an async status update fails', async () => {
    const user = userEvent.setup()
    const updateIssueStatus = vi.fn().mockRejectedValue(new Error('Network unavailable'))

    render(<SuggestionsHarness updateIssueStatus={updateIssueStatus} />)

    const issue = screen.getByRole('article', {
      name: /simplify formatting for ats parsing/i,
    })

    await user.click(within(issue).getByRole('button', { name: /dismiss issue/i }))

    expect(await within(issue).findByRole('alert')).toHaveTextContent(
      /could not update issue status/i,
    )
    expect(issue).toHaveTextContent(/status:\s*open/i)
  })

  it('fires issueInteracted analytics when an issue is handled or dismissed', async () => {
    const user = userEvent.setup()
    const track = vi.fn()
    const analytics = createAnalytics({ track })
    const updateIssueStatus = vi.fn()

    render(
      <SuggestionsHarness
        updateIssueStatus={updateIssueStatus}
        analytics={analytics}
      />,
    )

    const impactIssue = screen.getByRole('article', {
      name: /lead with measurable impact/i,
    })
    const formattingIssue = screen.getByRole('article', {
      name: /simplify formatting for ats parsing/i,
    })

    await user.click(within(impactIssue).getByRole('button', { name: /mark handled/i }))

    expect(track).toHaveBeenCalledWith({
      name: 'issue_interacted',
      payload: {
        reportId: 'report-1',
        issueId: 'issue-impact',
        action: 'handled',
      },
    })

    await user.click(within(formattingIssue).getByRole('button', { name: /dismiss issue/i }))

    expect(track).toHaveBeenCalledWith({
      name: 'issue_interacted',
      payload: {
        reportId: 'report-1',
        issueId: 'issue-formatting',
        action: 'dismissed',
      },
    })
  })
})
