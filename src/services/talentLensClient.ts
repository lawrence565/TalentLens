import type {
  AnalysisProgress,
  AnalysisStartResult,
  DiagnosisIssue,
  DiagnosisReport,
  FollowUpInput,
  FollowUpResponse,
  IssueStatus,
  UploadResumeResult,
} from '../types'

export interface TalentLensClient {
  uploadResume(file: File): Promise<UploadResumeResult>
  startAnalysis(resumeId: string): Promise<AnalysisStartResult>
  getAnalysisProgress(analysisId: string): Promise<AnalysisProgress>
  getDiagnosisReport(analysisId: string): Promise<DiagnosisReport>
  updateIssueStatus(issueId: string, status: IssueStatus): Promise<DiagnosisIssue>
  askFollowUp(input: FollowUpInput): Promise<FollowUpResponse>
}
