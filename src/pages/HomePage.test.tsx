import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAnalytics } from '../services/analytics'
import type { DiagnosisReport, FollowUpResponse } from '../types'
import HomePage from './HomePage'

const submitResume = vi.fn()
const reset = vi.fn()
const updateIssueStatus = vi.fn()
const askFollowUp = vi.fn()

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
  ],
  atsChecks: [
    {
      id: 'ats-1',
      type: 'parsing',
      label: 'Parsing risk',
      status: 'warning',
      reason: 'Columns may be read out of order.',
      nextAction: 'Use a single-column layout.',
    },
  ],
  followUpPrompts: ['How should I rewrite the first bullet?'],
  createdAt: '2026-04-30T10:00:00.000Z',
}

let diagnosisState = {
  status: 'idle',
  progress: 0,
  report: null as DiagnosisReport | null,
  error: null as string | null,
  slowAnalysisMessage: null as string | null,
  followUpResponse: null as FollowUpResponse | null,
  submitResume,
  reset,
  updateIssueStatus,
  askFollowUp,
}

vi.mock('../hooks/useDiagnosis', () => ({
  useDiagnosis: () => diagnosisState,
}))

const setDiagnosisState = (overrides: Partial<typeof diagnosisState>) => {
  diagnosisState = {
    ...diagnosisState,
    ...overrides,
  }
}

const makeFile = () => new File(['resume content'], 'resume.pdf', { type: 'application/pdf' })

describe('HomePage diagnosis flow', () => {
  beforeEach(() => {
    submitResume.mockReset()
    reset.mockReset()
    updateIssueStatus.mockReset()
    askFollowUp.mockReset()
    diagnosisState = {
      status: 'idle',
      progress: 0,
      report: null,
      error: null,
      slowAnalysisMessage: null,
      followUpResponse: null,
      submitResume,
      reset,
      updateIssueStatus,
      askFollowUp,
    }
  })

  it('submits a valid upload and renders upload, analysis, then report states', async () => {
    submitResume.mockResolvedValue(report)
    const user = userEvent.setup()
    const { rerender } = render(<HomePage />)

    await user.upload(screen.getByLabelText(/choose resume file/i), makeFile())

    expect(submitResume).toHaveBeenCalledWith(expect.objectContaining({ name: 'resume.pdf' }))

    setDiagnosisState({ status: 'uploading', progress: 20 })
    rerender(<HomePage />)
    expect(screen.getByText(/uploading resume/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /resume diagnosis report/i })).not.toBeInTheDocument()

    setDiagnosisState({ status: 'analyzing', progress: 55 })
    rerender(<HomePage />)
    expect(screen.getByText(/analyzing resume/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /resume diagnosis report/i })).not.toBeInTheDocument()

    setDiagnosisState({ status: 'reportReady', progress: 100, report })
    rerender(<HomePage />)
    expect(screen.getByRole('heading', { name: /resume diagnosis report/i })).toBeInTheDocument()
    expect(screen.getAllByText(/lead with measurable impact/i).length).toBeGreaterThan(0)
  })

  it('shows a completed upload bar while analysis is running', async () => {
    const user = userEvent.setup()
    submitResume.mockResolvedValue(report)
    setDiagnosisState({ status: 'analyzing', progress: 55 })

    render(<HomePage />)

    await user.upload(screen.getByLabelText(/choose resume file/i), makeFile())

    const uploadProgress = document.querySelector(
      '[role="progressbar"][aria-label="Upload progress"]',
    )

    expect(uploadProgress).toBeInTheDocument()
    expect(uploadProgress).toHaveAttribute('aria-valuenow', '100')
  })

  it('renders issue actions after the report is ready and delegates status updates', async () => {
    updateIssueStatus.mockResolvedValue({ ...report.issues[0], status: 'handled' })
    const user = userEvent.setup()

    setDiagnosisState({ status: 'reportReady', progress: 100, report })

    render(<HomePage />)

    expect(screen.getByRole('heading', { name: /issue actions/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mark handled/i }))

    expect(updateIssueStatus).toHaveBeenCalledWith('issue-1', 'handled')
  })

  it('shows slow-analysis status before the report is ready', () => {
    setDiagnosisState({
      status: 'slowAnalysis',
      progress: 65,
      slowAnalysisMessage:
        'We are still analyzing your resume. This can take a little longer for complex files.',
    })

    render(<HomePage />)

    expect(screen.getByText(/still analyzing your resume/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /resume diagnosis report/i })).not.toBeInTheDocument()
  })

  it('shows a timeout state when analysis exceeds the max wait', () => {
    setDiagnosisState({
      status: 'timeout',
      error: 'Analysis is taking too long. Please try again.',
    })

    render(<HomePage />)

    expect(screen.getByRole('alert')).toHaveTextContent(/analysis is taking too long/i)
    expect(screen.queryByRole('heading', { name: /resume diagnosis report/i })).not.toBeInTheDocument()
  })

  it('shows upload errors with an actionable retry control', async () => {
    const user = userEvent.setup()
    setDiagnosisState({
      status: 'error',
      error: 'Upload failed. Please try again.',
    })

    render(<HomePage />)

    expect(screen.getByRole('alert')).toHaveTextContent(/upload failed/i)

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('wires follow-up questions after the report is ready and renders the response', async () => {
    const user = userEvent.setup()
    askFollowUp.mockResolvedValue({
      id: 'follow-up-1',
      reportId: 'report-1',
      issueId: 'issue-1',
      answer: 'Rewrite the bullet around the outcome, scope, and action.',
      nextActions: ['Draft one measurable version.'],
      createdAt: '2026-04-30T10:01:00.000Z',
    })
    setDiagnosisState({ status: 'reportReady', progress: 100, report })

    const { rerender } = render(<HomePage />)

    expect(screen.getByRole('heading', { name: /resume diagnosis report/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /ask a follow-up/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/question/i), 'How should I rewrite this?')
    await user.click(screen.getByRole('button', { name: /ask follow-up/i }))

    expect(askFollowUp).toHaveBeenCalledWith({
      issueId: 'issue-1',
      question: 'How should I rewrite this?',
    })

    setDiagnosisState({
      followUpResponse: {
        id: 'follow-up-1',
        reportId: 'report-1',
        issueId: 'issue-1',
        answer: 'Rewrite the bullet around the outcome, scope, and action.',
        nextActions: ['Draft one measurable version.'],
        createdAt: '2026-04-30T10:01:00.000Z',
      },
    })
    rerender(<HomePage />)

    expect(screen.getByText(/rewrite the bullet around the outcome/i)).toBeInTheDocument()
  })

  it('shows report rating only after the report is ready and wires analytics without account prompts', async () => {
    const track = vi.fn()
    const analytics = createAnalytics({ track })
    const user = userEvent.setup()

    const { rerender } = render(<HomePage analytics={analytics} />)

    expect(
      screen.queryByRole('heading', { name: /was this report helpful/i }),
    ).not.toBeInTheDocument()

    setDiagnosisState({ status: 'reportReady', progress: 100, report })
    rerender(<HomePage analytics={analytics} />)

    expect(
      screen.getByRole('heading', { name: /was this report helpful/i }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/create an account/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/interview|callback|offer|hire|hiring outcome/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /somewhat/i }))
    await user.click(screen.getByRole('button', { name: /submit rating/i }))

    expect(track).toHaveBeenCalledWith({
      name: 'report_helpfulness_rating_submitted',
      payload: {
        reportId: 'report-1',
        rating: 3,
      },
    })
  })

  it('fires upload lifecycle analytics events when a report is returned', async () => {
    const track = vi.fn()
    const analytics = createAnalytics({ track })
    const user = userEvent.setup()
    submitResume.mockResolvedValue(report)

    render(<HomePage analytics={analytics} />)

    await user.upload(screen.getByLabelText(/choose resume file/i), makeFile())

    await waitFor(() => {
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'upload_started',
          payload: expect.objectContaining({
            fileType: 'application/pdf',
          }),
        }),
      )
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'upload_completed',
          payload: expect.objectContaining({
            resumeId: 'resume-1',
            analysisId: 'analysis-1',
          }),
        }),
      )
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'report_viewed',
          payload: expect.objectContaining({
            reportId: 'report-1',
          }),
        }),
      )
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'time_to_report_measured',
          payload: expect.objectContaining({
            reportId: 'report-1',
          }),
        }),
      )
    })
  })
})
