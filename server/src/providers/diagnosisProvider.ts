import type { ATSCheck, DiagnosisIssue, DiagnosisReport } from '../../../src/types'

export interface ResumeRecord {
  id: string
  fileName: string
  mimeType: string
  size: number
  uploadPath: string
  createdAt: string
}

export type DiagnosisReportDraft = Omit<DiagnosisReport, 'id' | 'resumeId' | 'analysisId' | 'createdAt'>

export interface DiagnosisProvider {
  generateReport(input: {
    resume: ResumeRecord
    analysisId: string
  }): Promise<DiagnosisReportDraft>
}

export type IssueDraft = Omit<DiagnosisIssue, 'id'>
export type ATSCheckDraft = Omit<ATSCheck, 'id'>
