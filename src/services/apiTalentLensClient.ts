import type { AnalyticsEvent } from './analytics'
import type {
  AnalysisProgress,
  AnalysisStartResult,
  DiagnosisIssue,
  DiagnosisReport,
  FollowUpInput,
  FollowUpResponse,
  IssueStatus,
  ReportRating,
  UploadResumeResult,
} from '../types'
import type { TalentLensClient } from './talentLensClient'

type ReportRatingInput = Omit<ReportRating, 'createdAt'>

export interface ApiTalentLensClient extends TalentLensClient {
  submitReportRating(input: ReportRatingInput): Promise<ReportRating>
  trackAnalyticsEvent(event: AnalyticsEvent): Promise<void>
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const parseResponse = async <T>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : 'Request failed.'

    throw new Error(message)
  }

  return body as T
}

const jsonRequest = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body === undefined ? undefined : JSON.stringify(body),
})

export const createApiTalentLensClient = (baseUrl: string): ApiTalentLensClient => {
  const apiBaseUrl = trimTrailingSlash(baseUrl)

  return {
    async uploadResume(file) {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch(`${apiBaseUrl}/resumes`, {
        method: 'POST',
        body: formData,
      })

      return parseResponse<UploadResumeResult>(response)
    },

    async startAnalysis(resumeId) {
      const response = await fetch(
        `${apiBaseUrl}/resumes/${encodeURIComponent(resumeId)}/analyses`,
        jsonRequest('POST'),
      )

      return parseResponse<AnalysisStartResult>(response)
    },

    async getAnalysisProgress(analysisId) {
      const response = await fetch(
        `${apiBaseUrl}/analyses/${encodeURIComponent(analysisId)}/progress`,
        jsonRequest('GET'),
      )

      return parseResponse<AnalysisProgress>(response)
    },

    async getDiagnosisReport(analysisId) {
      const response = await fetch(
        `${apiBaseUrl}/analyses/${encodeURIComponent(analysisId)}/report`,
        jsonRequest('GET'),
      )

      return parseResponse<DiagnosisReport>(response)
    },

    async updateIssueStatus(issueId, status: IssueStatus) {
      const response = await fetch(
        `${apiBaseUrl}/issues/${encodeURIComponent(issueId)}/status`,
        jsonRequest('PATCH', { status }),
      )

      return parseResponse<DiagnosisIssue>(response)
    },

    async askFollowUp(input: FollowUpInput) {
      const response = await fetch(
        `${apiBaseUrl}/reports/${encodeURIComponent(input.reportId)}/follow-ups`,
        jsonRequest('POST', {
          issueId: input.issueId,
          question: input.question,
        }),
      )

      return parseResponse<FollowUpResponse>(response)
    },

    async submitReportRating(input) {
      const response = await fetch(
        `${apiBaseUrl}/reports/${encodeURIComponent(input.reportId)}/ratings`,
        jsonRequest('POST', {
          rating: input.rating,
          helpedUnderstandNextSteps: input.helpedUnderstandNextSteps,
          feedback: input.feedback,
        }),
      )

      return parseResponse<ReportRating>(response)
    },

    async trackAnalyticsEvent(event) {
      const response = await fetch(`${apiBaseUrl}/analytics-events`, jsonRequest('POST', event))
      await parseResponse<{ ok: boolean }>(response)
    },
  }
}
