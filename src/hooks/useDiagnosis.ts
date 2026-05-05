import { useCallback, useEffect, useRef, useState } from 'react'
import { createTalentLensClient } from '../services/talentLensClientFactory'
import type { TalentLensClient } from '../services/talentLensClient'
import type {
  DiagnosisIssue,
  DiagnosisReport,
  FollowUpInput,
  FollowUpResponse,
  IssueStatus,
} from '../types'

export type DiagnosisStatus =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'slowAnalysis'
  | 'reportReady'
  | 'timeout'
  | 'error'

interface UseDiagnosisOptions {
  client?: TalentLensClient
  pollIntervalMs?: number
  slowThresholdMs?: number
  maxWaitMs?: number
}

interface FollowUpRequest {
  issueId?: string
  question: string
}

interface UseDiagnosisReturn {
  status: DiagnosisStatus
  progress: number
  report: DiagnosisReport | null
  error: string | null
  slowAnalysisMessage: string | null
  followUpResponse: FollowUpResponse | null
  submitResume: (file: File) => Promise<DiagnosisReport | null>
  reset: () => void
  updateIssueStatus: (issueId: string, status: IssueStatus) => Promise<DiagnosisIssue>
  askFollowUp: (input: FollowUpRequest | string) => Promise<FollowUpResponse>
}

const DEFAULT_POLL_INTERVAL_MS = 1000
const DEFAULT_SLOW_THRESHOLD_MS = 180 * 1000
const DEFAULT_MAX_WAIT_MS = 5 * 60 * 1000

const UPLOAD_FAILED_MESSAGE = 'Upload failed. Please try again.'
const ANALYSIS_FAILED_MESSAGE = 'Analysis failed. Please try again.'
const REPORT_FAILED_MESSAGE = 'Report failed to load. Please try again.'
const TIMEOUT_MESSAGE = 'Analysis is taking too long. Please try again.'
const SLOW_ANALYSIS_MESSAGE = 'We are still analyzing your resume. This can take a little longer for complex files.'

const wait = (delayMs: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs)
  })

export const useDiagnosis = ({
  client,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  slowThresholdMs = DEFAULT_SLOW_THRESHOLD_MS,
  maxWaitMs = DEFAULT_MAX_WAIT_MS,
}: UseDiagnosisOptions = {}): UseDiagnosisReturn => {
  const defaultClientRef = useRef<TalentLensClient | null>(null)

  if (!defaultClientRef.current) {
    defaultClientRef.current = createTalentLensClient()
  }

  const activeClient = client ?? defaultClientRef.current
  const [status, setStatus] = useState<DiagnosisStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [report, setReport] = useState<DiagnosisReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [slowAnalysisMessage, setSlowAnalysisMessage] = useState<string | null>(null)
  const [followUpResponse, setFollowUpResponse] = useState<FollowUpResponse | null>(null)
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      requestIdRef.current += 1
    }
  }, [])

  const reset = useCallback(() => {
    requestIdRef.current += 1
    setStatus('idle')
    setProgress(0)
    setReport(null)
    setError(null)
    setSlowAnalysisMessage(null)
    setFollowUpResponse(null)
  }, [])

  const submitResume = useCallback(
    async (file: File): Promise<DiagnosisReport | null> => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId
      const isActiveRequest = () => mountedRef.current && requestIdRef.current === requestId

      setStatus('uploading')
      setProgress(0)
      setReport(null)
      setError(null)
      setSlowAnalysisMessage(null)
      setFollowUpResponse(null)

      let resumeId: string

      try {
        const upload = await activeClient.uploadResume(file)
        resumeId = upload.resumeId
      } catch {
        if (isActiveRequest()) {
          setStatus('error')
          setError(UPLOAD_FAILED_MESSAGE)
        }

        throw new Error(UPLOAD_FAILED_MESSAGE)
      }

      if (!isActiveRequest()) {
        return null
      }

      setStatus('analyzing')

      let analysisId: string

      try {
        const analysis = await activeClient.startAnalysis(resumeId)
        analysisId = analysis.analysisId
      } catch {
        if (isActiveRequest()) {
          setStatus('error')
          setError(ANALYSIS_FAILED_MESSAGE)
        }

        throw new Error(ANALYSIS_FAILED_MESSAGE)
      }

      const startedAt = Date.now()

      while (isActiveRequest()) {
        const elapsedMs = Date.now() - startedAt

        if (elapsedMs >= maxWaitMs) {
          setStatus('timeout')
          setError(TIMEOUT_MESSAGE)
          return null
        }

        if (elapsedMs >= slowThresholdMs) {
          setStatus('slowAnalysis')
          setSlowAnalysisMessage(SLOW_ANALYSIS_MESSAGE)
        }

        let analysisProgress

        try {
          analysisProgress = await activeClient.getAnalysisProgress(analysisId)
        } catch {
          if (isActiveRequest()) {
            setStatus('error')
            setError(ANALYSIS_FAILED_MESSAGE)
          }

          throw new Error(ANALYSIS_FAILED_MESSAGE)
        }

        if (!isActiveRequest()) {
          return null
        }

        setProgress(analysisProgress.progress)

        if (analysisProgress.status === 'failed') {
          setStatus('error')
          setError(ANALYSIS_FAILED_MESSAGE)
          throw new Error(ANALYSIS_FAILED_MESSAGE)
        }

        if (analysisProgress.status === 'completed') {
          try {
            const diagnosisReport = await activeClient.getDiagnosisReport(analysisId)

            if (isActiveRequest()) {
              setReport(diagnosisReport)
              setProgress(100)
              setStatus('reportReady')
            }

            return diagnosisReport
          } catch {
            if (isActiveRequest()) {
              setStatus('error')
              setError(REPORT_FAILED_MESSAGE)
            }

            throw new Error(REPORT_FAILED_MESSAGE)
          }
        }

        await wait(pollIntervalMs)
      }

      return null
    },
    [activeClient, maxWaitMs, pollIntervalMs, slowThresholdMs],
  )

  const updateIssueStatus = useCallback(
    async (issueId: string, issueStatus: IssueStatus): Promise<DiagnosisIssue> => {
      const updatedIssue = await activeClient.updateIssueStatus(issueId, issueStatus)

      if (!mountedRef.current) {
        return updatedIssue
      }

      setReport((currentReport) => {
        if (!currentReport) {
          return currentReport
        }

        return {
          ...currentReport,
          issues: currentReport.issues.map((issue) =>
            issue.id === updatedIssue.id ? updatedIssue : issue,
          ),
        }
      })

      return updatedIssue
    },
    [activeClient],
  )

  const askFollowUp = useCallback(
    async (input: FollowUpRequest | string): Promise<FollowUpResponse> => {
      if (!report) {
        throw new Error('Report is not ready.')
      }

      const followUpInput: FollowUpInput =
        typeof input === 'string'
          ? { reportId: report.id, question: input }
          : { reportId: report.id, ...input }
      const response = await activeClient.askFollowUp(followUpInput)

      if (mountedRef.current) {
        setFollowUpResponse(response)
      }

      return response
    },
    [activeClient, report],
  )

  return {
    status,
    progress,
    report,
    error,
    slowAnalysisMessage,
    followUpResponse,
    submitResume,
    reset,
    updateIssueStatus,
    askFollowUp,
  }
}
