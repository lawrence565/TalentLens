import type {
  AnalysisProgress,
  DiagnosisIssue,
  DiagnosisReport,
  FollowUpInput,
  IssueStatus,
} from '../types'
import type { TalentLensClient } from './talentLensClient'

const SUPPORTED_RESUME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const SUPPORTED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx']
const CREATED_AT = '2026-04-30T10:00:00.000Z'

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const getResumeId = (file: File) => `resume-${toSlug(file.name)}-${file.size}`

const getResumeIdFromAnalysisId = (analysisId: string) => analysisId.replace(/^analysis-/, '')

const isSupportedResumeFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase()

  return (
    SUPPORTED_RESUME_TYPES.has(file.type) ||
    SUPPORTED_RESUME_EXTENSIONS.some((extension) => fileName.endsWith(extension))
  )
}

const createReport = (resumeId: string, analysisId: string): DiagnosisReport => ({
  id: `report-${resumeId}`,
  resumeId,
  analysisId,
  overallScore: 72,
  summary:
    'The resume has a solid foundation, but the impact bullets, section order, and ATS readability need focused improvements before sharing it for target roles.',
  issues: [
    {
      id: 'issue-impact-bullets',
      title: 'Lead with measurable impact',
      severity: 'high',
      category: 'content_clarity',
      reason:
        'Several bullets describe responsibilities without showing scope, results, or business value.',
      nextAction:
        'Rewrite the top three experience bullets to include metrics, tools, and outcomes.',
      status: 'open',
      priority: 1,
    },
    {
      id: 'issue-section-order',
      title: 'Move core experience above supporting details',
      severity: 'medium',
      category: 'structure',
      reason:
        'The strongest recent role and skills summary should appear before less relevant sections.',
      nextAction:
        'Place the professional summary, skills, and recent experience before projects and coursework.',
      status: 'open',
      priority: 2,
    },
    {
      id: 'issue-role-keywords',
      title: 'Add role-specific keywords',
      severity: 'medium',
      category: 'keywords',
      reason:
        'The resume underuses common product analytics and stakeholder-management terms for the target role.',
      nextAction:
        'Add accurate keywords from target role descriptions where they match your real experience.',
      status: 'open',
      priority: 3,
    },
    {
      id: 'issue-achievements-section',
      title: 'Include a selected achievements section',
      severity: 'low',
      category: 'missing_sections',
      reason:
        'A compact achievements section would make leadership and cross-functional results easier to scan.',
      nextAction:
        'Add two or three achievements that connect directly to the roles you plan to pursue.',
      status: 'open',
      priority: 4,
    },
    {
      id: 'issue-ats-formatting',
      title: 'Simplify formatting for ATS parsing',
      severity: 'high',
      category: 'formatting',
      additionalCategories: ['ats_risk'],
      reason:
        'Dense columns and decorative separators may make headings and dates harder for resume parsers to read.',
      nextAction:
        'Use single-column sections, standard headings, and plain text bullets for the work-history area.',
      status: 'open',
      priority: 5,
    },
  ],
  atsChecks: [
    {
      id: 'ats-parsing',
      type: 'parsing',
      label: 'Parsing risk',
      status: 'warning',
      reason: 'Columns may be read out of order by automated parsers.',
      nextAction: 'Use a single-column layout for experience and education.',
    },
    {
      id: 'ats-headings',
      type: 'headings',
      label: 'Headings',
      status: 'pass',
      reason: 'Most section headings use standard resume language.',
      nextAction: 'Keep section names direct and conventional.',
    },
    {
      id: 'ats-readability',
      type: 'readability',
      label: 'Readability',
      status: 'warning',
      reason: 'Some bullets run long and bury the result at the end.',
      nextAction: 'Keep bullets to one or two lines with the result near the start.',
    },
    {
      id: 'ats-file-format',
      type: 'file_format',
      label: 'File format',
      status: 'pass',
      reason: 'The uploaded format is supported for this analysis.',
      nextAction: 'Keep a DOCX version available when a plain document is requested.',
    },
  ],
  followUpPrompts: [
    'How should I rewrite the first experience bullet?',
    'Which keywords fit product analyst roles?',
  ],
  createdAt: CREATED_AT,
})

const cloneReport = (report: DiagnosisReport): DiagnosisReport => ({
  ...report,
  issues: report.issues.map((issue) => ({
    ...issue,
    additionalCategories: issue.additionalCategories
      ? [...issue.additionalCategories]
      : undefined,
  })),
  atsChecks: report.atsChecks.map((check) => ({ ...check })),
  followUpPrompts: [...report.followUpPrompts],
})

export const createMockTalentLensClient = (): TalentLensClient => {
  const reports = new Map<string, DiagnosisReport>()

  const findIssue = (issueId: string): DiagnosisIssue | undefined => {
    for (const report of reports.values()) {
      const issue = report.issues.find((candidate) => candidate.id === issueId)

      if (issue) {
        return issue
      }
    }

    return undefined
  }

  return {
    async uploadResume(file) {
      if (!isSupportedResumeFile(file)) {
        throw new Error('Upload a PDF, DOC, or DOCX resume.')
      }

      return {
        resumeId: getResumeId(file),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: CREATED_AT,
      }
    },

    async startAnalysis(resumeId) {
      return {
        analysisId: `analysis-${resumeId}`,
        resumeId,
        status: 'processing',
      }
    },

    async getAnalysisProgress(analysisId) {
      const resumeId = getResumeIdFromAnalysisId(analysisId)

      return {
        analysisId,
        status: 'completed',
        progress: 100,
        estimatedSecondsRemaining: 0,
        reportId: `report-${resumeId}`,
      } satisfies AnalysisProgress
    },

    async getDiagnosisReport(analysisId) {
      const resumeId = getResumeIdFromAnalysisId(analysisId)
      const report = reports.get(analysisId) ?? createReport(resumeId, analysisId)

      reports.set(analysisId, report)

      return cloneReport(report)
    },

    async updateIssueStatus(issueId, status: IssueStatus) {
      const issue = findIssue(issueId)

      if (!issue) {
        throw new Error('Issue not found.')
      }

      issue.status = status

      return { ...issue }
    },

    async askFollowUp(input: FollowUpInput) {
      return {
        id: `follow-up-${input.reportId}-${input.issueId ?? 'general'}`,
        reportId: input.reportId,
        issueId: input.issueId,
        answer:
          'Use the issue context to make one focused change, then reread the surrounding section for clarity and consistency.',
        nextActions: [
          'Revise the most relevant bullet first.',
          'Check that the change remains accurate to your experience.',
          'Keep the final wording concise and easy to scan.',
        ],
        createdAt: CREATED_AT,
      }
    },
  }
}
