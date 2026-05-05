import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createApiTalentLensClient } from './apiTalentLensClient'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('createApiTalentLensClient', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    fetchMock.mockReset()
  })

  test('uploads resumes as multipart form data', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        resumeId: 'resume-1',
        fileName: 'resume.pdf',
        fileSize: 123,
        fileType: 'application/pdf',
        uploadedAt: '2026-05-05T00:00:00.000Z',
      }),
    )
    const client = createApiTalentLensClient('http://localhost:5174/api')
    const file = new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })

    const result = await client.uploadResume(file)

    expect(result.resumeId).toBe('resume-1')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5174/api/resumes',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    )
  })

  test('maps the analysis and report endpoints to the frontend client contract', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ analysisId: 'analysis-1', resumeId: 'resume-1', status: 'queued' }))
      .mockResolvedValueOnce(
        jsonResponse({
          analysisId: 'analysis-1',
          status: 'completed',
          progress: 100,
          estimatedSecondsRemaining: 0,
          reportId: 'report-1',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'report-1',
          resumeId: 'resume-1',
          analysisId: 'analysis-1',
          overallScore: 72,
          summary: 'Focused improvements are available.',
          issues: [],
          atsChecks: [],
          followUpPrompts: [],
          createdAt: '2026-05-05T00:00:00.000Z',
        }),
      )
    const client = createApiTalentLensClient('http://localhost:5174/api/')

    await expect(client.startAnalysis('resume-1')).resolves.toMatchObject({ status: 'queued' })
    await expect(client.getAnalysisProgress('analysis-1')).resolves.toMatchObject({ reportId: 'report-1' })
    await expect(client.getDiagnosisReport('analysis-1')).resolves.toMatchObject({ id: 'report-1' })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:5174/api/resumes/resume-1/analyses',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:5174/api/analyses/analysis-1/progress',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:5174/api/analyses/analysis-1/report',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  test('sends issue status updates, follow-ups, ratings, and analytics events', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'issue-1',
          title: 'Improve impact',
          severity: 'high',
          category: 'content_clarity',
          reason: 'The bullet lacks measurable detail.',
          nextAction: 'Add scope and outcome.',
          status: 'handled',
          priority: 1,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'follow-up-1',
          reportId: 'report-1',
          issueId: 'issue-1',
          answer: 'Start with the result.',
          nextActions: ['Add one metric.'],
          createdAt: '2026-05-05T00:00:00.000Z',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          reportId: 'report-1',
          rating: 5,
          helpedUnderstandNextSteps: true,
          feedback: 'Clear',
          createdAt: '2026-05-05T00:00:00.000Z',
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    const client = createApiTalentLensClient('http://localhost:5174/api')

    await client.updateIssueStatus('issue-1', 'handled')
    await client.askFollowUp({ reportId: 'report-1', issueId: 'issue-1', question: 'What first?' })
    await client.submitReportRating({
      reportId: 'report-1',
      rating: 5,
      helpedUnderstandNextSteps: true,
      feedback: 'Clear',
    })
    await client.trackAnalyticsEvent({
      name: 'report_viewed',
      payload: { reportId: 'report-1' },
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:5174/api/issues/issue-1/status',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'handled' }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:5174/api/reports/report-1/follow-ups',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ issueId: 'issue-1', question: 'What first?' }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:5174/api/reports/report-1/ratings',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          rating: 5,
          helpedUnderstandNextSteps: true,
          feedback: 'Clear',
        }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'http://localhost:5174/api/analytics-events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'report_viewed',
          payload: { reportId: 'report-1' },
        }),
      }),
    )
  })

  test('throws safe API errors when requests fail', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Invalid file format.' }, 400))
    const client = createApiTalentLensClient('http://localhost:5174/api')

    await expect(client.getDiagnosisReport('analysis-1')).rejects.toThrow('Invalid file format.')
  })
})
