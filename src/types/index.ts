// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// File Upload Types
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

// Diagnosis Domain Types
export const IssueSeverity = ['low', 'medium', 'high'] as const
export type IssueSeverity = (typeof IssueSeverity)[number]

export const IssueStatus = ['open', 'handled', 'dismissed'] as const
export type IssueStatus = (typeof IssueStatus)[number]

export const IssueCategory = [
  'content_clarity',
  'structure',
  'keywords',
  'missing_sections',
  'formatting',
  'ats_risk',
] as const
export type IssueCategory = (typeof IssueCategory)[number]

export const categoryLabels: Record<IssueCategory, string> = {
  content_clarity: 'Content clarity',
  structure: 'Structure',
  keywords: 'Keywords',
  missing_sections: 'Missing sections',
  formatting: 'Formatting',
  ats_risk: 'ATS risk',
}

export const ATSCheck = {
  types: ['parsing', 'headings', 'readability', 'file_format'],
  statuses: ['pass', 'warning', 'fail'],
} as const

export interface ATSCheck {
  id: string
  type: (typeof ATSCheck.types)[number]
  label: string
  status: (typeof ATSCheck.statuses)[number]
  reason: string
  nextAction: string
}

export interface DiagnosisIssue {
  id: string
  title: string
  severity: IssueSeverity
  category: IssueCategory
  additionalCategories?: IssueCategory[]
  reason: string
  nextAction: string
  status: IssueStatus
  priority: number
}

export interface SuggestionItemProps {
  reportId: string
  issue: DiagnosisIssue
  onUpdateStatus: (
    issueId: string,
    status: IssueStatus,
  ) => void | Promise<DiagnosisIssue>
}

export interface DiagnosisReport {
  id: string
  resumeId: string
  analysisId: string
  overallScore: number
  summary: string
  issues: DiagnosisIssue[]
  atsChecks: ATSCheck[]
  followUpPrompts: string[]
  createdAt: string
}

export interface UploadResumeResult {
  resumeId: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
}

export interface AnalysisStartResult {
  analysisId: string
  resumeId: string
  status: 'queued' | 'processing'
}

export interface AnalysisProgress {
  analysisId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  estimatedSecondsRemaining?: number
  reportId?: string
  error?: string
}

export interface FollowUpInput {
  reportId: string
  issueId?: string
  question: string
}

export interface FollowUpResponse {
  id: string
  reportId: string
  issueId?: string
  answer: string
  nextActions: string[]
  createdAt: string
}

export interface ReportRating {
  reportId: string
  rating: 1 | 2 | 3 | 4 | 5
  helpedUnderstandNextSteps: boolean
  feedback?: string
  createdAt: string
}
