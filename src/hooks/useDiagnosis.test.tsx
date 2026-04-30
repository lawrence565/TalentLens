import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TalentLensClient } from '../services/talentLensClient'
import type {
  AnalysisProgress,
  AnalysisStartResult,
  DiagnosisReport,
  FollowUpResponse,
  UploadResumeResult,
} from '../types'
import { useDiagnosis } from './useDiagnosis'

const CREATED_AT = '2026-04-30T10:00:00.000Z'

const makeFile = (name = 'resume.pdf', type = 'application/pdf') =>
  new File(['resume content'], name, { type })

const makeReport = (): DiagnosisReport => ({
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
  createdAt: CREATED_AT,
})

const makeUpload = (): UploadResumeResult => ({
  resumeId: 'resume-1',
  fileName: 'resume.pdf',
  fileSize: 14,
  fileType: 'application/pdf',
  uploadedAt: CREATED_AT,
})

const makeAnalysis = (): AnalysisStartResult => ({
  analysisId: 'analysis-1',
  resumeId: 'resume-1',
  status: 'processing',
})

const makeProgress = (
  status: AnalysisProgress['status'],
  progress: number,
): AnalysisProgress => ({
  analysisId: 'analysis-1',
  status,
  progress,
  estimatedSecondsRemaining: status === 'completed' ? 0 : 30,
  reportId: status === 'completed' ? 'report-1' : undefined,
})

const makeClient = (overrides: Partial<TalentLensClient> = {}): TalentLensClient => ({
  uploadResume: vi.fn(async () => makeUpload()),
  startAnalysis: vi.fn(async () => makeAnalysis()),
  getAnalysisProgress: vi.fn(async () => makeProgress('completed', 100)),
  getDiagnosisReport: vi.fn(async () => makeReport()),
  updateIssueStatus: vi.fn(async (issueId, status) => ({
    ...makeReport().issues[0],
    id: issueId,
    status,
  })),
  askFollowUp: vi.fn(async (input) => ({
    id: 'follow-up-1',
    reportId: input.reportId,
    issueId: input.issueId,
    answer: 'Make one focused change and keep it accurate.',
    nextActions: ['Revise the relevant bullet.', 'Reread the section for clarity.'],
    createdAt: CREATED_AT,
  })),
  ...overrides,
})

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, resolve, reject }
}

const flushPromises = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

describe('useDiagnosis', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('moves from idle to uploading to analyzing to reportReady', async () => {
    const upload = deferred<UploadResumeResult>()
    const analysis = deferred<AnalysisStartResult>()
    const client = makeClient({
      uploadResume: vi.fn(() => upload.promise),
      startAnalysis: vi.fn(() => analysis.promise),
      getAnalysisProgress: vi.fn(async () => makeProgress('completed', 100)),
    })
    const { result } = renderHook(() =>
      useDiagnosis({ client, pollIntervalMs: 25, slowThresholdMs: 1000, maxWaitMs: 5000 }),
    )

    expect(result.current.status).toBe('idle')

    let submitPromise: Promise<DiagnosisReport | null>
    await act(async () => {
      submitPromise = result.current.submitResume(makeFile())
      await Promise.resolve()
    })

    expect(result.current.status).toBe('uploading')

    await act(async () => {
      upload.resolve(makeUpload())
      await Promise.resolve()
    })

    expect(result.current.status).toBe('analyzing')

    await act(async () => {
      analysis.resolve(makeAnalysis())
      await submitPromise
    })

    expect(result.current.status).toBe('reportReady')
    expect(result.current.progress).toBe(100)
    expect(result.current.report).toMatchObject({ id: 'report-1' })
  })

  it('polls progress while analysis is running', async () => {
    const getAnalysisProgress = vi
      .fn()
      .mockResolvedValueOnce(makeProgress('processing', 25))
      .mockResolvedValueOnce(makeProgress('processing', 60))
      .mockResolvedValueOnce(makeProgress('completed', 100))
    const client = makeClient({ getAnalysisProgress })
    const { result } = renderHook(() =>
      useDiagnosis({ client, pollIntervalMs: 50, slowThresholdMs: 1000, maxWaitMs: 5000 }),
    )

    await act(async () => {
      void result.current.submitResume(makeFile())
      await Promise.resolve()
    })

    await act(async () => {
      await flushPromises()
    })

    expect(result.current.progress).toBe(25)
    expect(result.current.status).toBe('analyzing')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50)
    })

    expect(result.current.progress).toBe(60)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50)
    })

    expect(result.current.status).toBe('reportReady')
    expect(getAnalysisProgress).toHaveBeenCalledTimes(3)
  })

  it('shows a slow-analysis status before the 3-minute target is exceeded', async () => {
    const client = makeClient({
      getAnalysisProgress: vi.fn(async () => makeProgress('processing', 45)),
    })
    const { result } = renderHook(() =>
      useDiagnosis({ client, pollIntervalMs: 50, slowThresholdMs: 100, maxWaitMs: 1000 }),
    )

    await act(async () => {
      void result.current.submitResume(makeFile())
      await Promise.resolve()
    })

    await act(async () => {
      await flushPromises()
    })

    expect(result.current.status).toBe('analyzing')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    expect(result.current.status).toBe('slowAnalysis')
    expect(result.current.slowAnalysisMessage).toContain('still analyzing')
    expect(result.current.error).toBeNull()
  })

  it('uses a default slow-analysis threshold before the 3-minute target is exceeded', async () => {
    const client = makeClient({
      getAnalysisProgress: vi.fn(async () => makeProgress('processing', 45)),
    })
    const { result } = renderHook(() =>
      useDiagnosis({ client, pollIntervalMs: 1000, maxWaitMs: 5 * 60 * 1000 }),
    )

    await act(async () => {
      void result.current.submitResume(makeFile())
      await flushPromises()
    })

    expect(result.current.status).toBe('analyzing')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(181 * 1000)
    })

    expect(result.current.status).toBe('slowAnalysis')
    expect(result.current.error).toBeNull()
  })

  it('stops polling after unmount', async () => {
    const getAnalysisProgress = vi.fn(async () => makeProgress('processing', 35))
    const client = makeClient({ getAnalysisProgress })
    const { result, unmount } = renderHook(() =>
      useDiagnosis({ client, pollIntervalMs: 50, slowThresholdMs: 1000, maxWaitMs: 5000 }),
    )

    await act(async () => {
      void result.current.submitResume(makeFile())
      await flushPromises()
    })

    expect(getAnalysisProgress).toHaveBeenCalledTimes(1)

    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(getAnalysisProgress).toHaveBeenCalledTimes(1)
  })

  it('does not load a report from in-flight progress after unmount', async () => {
    const progress = deferred<AnalysisProgress>()
    const getDiagnosisReport = vi.fn(async () => makeReport())
    const client = makeClient({
      getAnalysisProgress: vi.fn(() => progress.promise),
      getDiagnosisReport,
    })
    const { result, unmount } = renderHook(() =>
      useDiagnosis({ client, pollIntervalMs: 50, slowThresholdMs: 1000, maxWaitMs: 5000 }),
    )
    let submitPromise: Promise<DiagnosisReport | null>

    await act(async () => {
      submitPromise = result.current.submitResume(makeFile())
      await flushPromises()
    })

    unmount()

    await act(async () => {
      progress.resolve(makeProgress('completed', 100))
      await submitPromise
    })

    expect(getDiagnosisReport).not.toHaveBeenCalled()
  })

  it('times out if analysis exceeds the configured maximum wait', async () => {
    const client = makeClient({
      getAnalysisProgress: vi.fn(async () => makeProgress('processing', 70)),
    })
    const { result } = renderHook(() =>
      useDiagnosis({ client, pollIntervalMs: 50, slowThresholdMs: 100, maxWaitMs: 150 }),
    )

    await act(async () => {
      void result.current.submitResume(makeFile())
      await Promise.resolve()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(151)
    })

    expect(result.current.status).toBe('timeout')
    expect(result.current.error).toBe('Analysis is taking too long. Please try again.')
  })

  it('surfaces upload failure without raw file details', async () => {
    const client = makeClient({
      uploadResume: vi.fn(async () => {
        throw new Error('raw resume content leaked')
      }),
    })
    const { result } = renderHook(() => useDiagnosis({ client }))

    await act(async () => {
      await expect(result.current.submitResume(makeFile())).rejects.toThrow(
        'Upload failed. Please try again.',
      )
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Upload failed. Please try again.')
    expect(result.current.error).not.toContain('raw resume content leaked')
  })

  it('surfaces analysis failure', async () => {
    const client = makeClient({
      startAnalysis: vi.fn(async () => {
        throw new Error('analysis service failed')
      }),
    })
    const { result } = renderHook(() => useDiagnosis({ client }))

    await act(async () => {
      await expect(result.current.submitResume(makeFile())).rejects.toThrow(
        'Analysis failed. Please try again.',
      )
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Analysis failed. Please try again.')
  })

  it('surfaces report loading failure', async () => {
    const client = makeClient({
      getDiagnosisReport: vi.fn(async () => {
        throw new Error('report failed')
      }),
    })
    const { result } = renderHook(() => useDiagnosis({ client }))

    await act(async () => {
      await expect(result.current.submitResume(makeFile())).rejects.toThrow(
        'Report failed to load. Please try again.',
      )
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Report failed to load. Please try again.')
  })

  it('resets lifecycle state', async () => {
    const { result } = renderHook(() => useDiagnosis({ client: makeClient() }))

    await act(async () => {
      await result.current.submitResume(makeFile())
    })

    expect(result.current.status).toBe('reportReady')

    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.progress).toBe(0)
    expect(result.current.report).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('updates issue status in the ready report', async () => {
    const updateIssueStatus = vi.fn(async () => ({
      ...makeReport().issues[0],
      status: 'handled' as const,
    }))
    const { result } = renderHook(() =>
      useDiagnosis({ client: makeClient({ updateIssueStatus }) }),
    )

    await act(async () => {
      await result.current.submitResume(makeFile())
    })

    await act(async () => {
      await result.current.updateIssueStatus('issue-1', 'handled')
    })

    expect(updateIssueStatus).toHaveBeenCalledWith('issue-1', 'handled')
    expect(result.current.report?.issues[0].status).toBe('handled')
  })

  it('does not update issue state after unmount', async () => {
    const update = deferred<DiagnosisReport['issues'][number]>()
    const updateIssueStatus = vi.fn(() => update.promise)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { result, unmount } = renderHook(() =>
      useDiagnosis({ client: makeClient({ updateIssueStatus }) }),
    )

    await act(async () => {
      await result.current.submitResume(makeFile())
    })

    const updatePromise = result.current.updateIssueStatus('issue-1', 'handled')

    unmount()

    update.resolve({
      ...makeReport().issues[0],
      status: 'handled',
    })
    await updatePromise

    expect(result.current.report?.issues[0].status).toBe('open')
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('requests follow-up guidance for the current report', async () => {
    const askFollowUp = vi.fn(async (): Promise<FollowUpResponse> => ({
      id: 'follow-up-1',
      reportId: 'report-1',
      issueId: 'issue-1',
      answer: 'Rewrite this bullet with scope and outcome.',
      nextActions: ['Add a metric.', 'Keep the wording accurate.'],
      createdAt: CREATED_AT,
    }))
    const { result } = renderHook(() => useDiagnosis({ client: makeClient({ askFollowUp }) }))

    await act(async () => {
      await result.current.submitResume(makeFile())
    })

    let response: FollowUpResponse
    await act(async () => {
      response = await result.current.askFollowUp({
        issueId: 'issue-1',
        question: 'How should I improve this bullet?',
      })
    })

    expect(askFollowUp).toHaveBeenCalledWith({
      reportId: 'report-1',
      issueId: 'issue-1',
      question: 'How should I improve this bullet?',
    })
    expect(response!).toMatchObject({ id: 'follow-up-1' })
    expect(result.current.followUpResponse).toMatchObject({ id: 'follow-up-1' })
  })

  it('does not store follow-up guidance after unmount', async () => {
    const followUp = deferred<FollowUpResponse>()
    const askFollowUp = vi.fn(() => followUp.promise)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { result, unmount } = renderHook(() => useDiagnosis({ client: makeClient({ askFollowUp }) }))

    await act(async () => {
      await result.current.submitResume(makeFile())
    })

    const followUpPromise = result.current.askFollowUp({
      issueId: 'issue-1',
      question: 'How should I improve this bullet?',
    })

    unmount()

    followUp.resolve({
      id: 'follow-up-1',
      reportId: 'report-1',
      issueId: 'issue-1',
      answer: 'Rewrite this bullet with scope and outcome.',
      nextActions: ['Add a metric.', 'Keep the wording accurate.'],
      createdAt: CREATED_AT,
    })
    await followUpPromise

    expect(result.current.followUpResponse).toBeNull()
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
