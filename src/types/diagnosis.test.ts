import { describe, expect, it } from 'vitest'
import {
  ATSCheck,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  type DiagnosisReport,
} from './index'

const allIssueCategories = [
  'content_clarity',
  'structure',
  'keywords',
  'missing_sections',
  'formatting',
  'ats_risk',
] satisfies IssueCategory[]

const report: DiagnosisReport = {
  id: 'report-1',
  resumeId: 'resume-1',
  analysisId: 'analysis-1',
  overallScore: 72,
  summary:
    'The resume has a clear foundation, but the impact bullets, section order, and ATS readability need focused improvements before sharing it with employers.',
  issues: [
    {
      id: 'issue-1',
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
      id: 'issue-2',
      title: 'Move core experience above supporting details',
      severity: 'medium',
      category: 'structure',
      reason:
        'Recruiters need the strongest recent role and skills summary before less relevant sections.',
      nextAction:
        'Place the professional summary, skills, and recent experience before projects and coursework.',
      status: 'open',
      priority: 2,
    },
    {
      id: 'issue-3',
      title: 'Add role-specific keywords',
      severity: 'medium',
      category: 'keywords',
      reason:
        'The resume underuses common product analytics and stakeholder-management terms for the target role.',
      nextAction:
        'Add accurate keywords from target job descriptions where they match your real experience.',
      status: 'handled',
      priority: 3,
    },
    {
      id: 'issue-4',
      title: 'Include a selected achievements section',
      severity: 'low',
      category: 'missing_sections',
      reason:
        'A compact achievements section would make leadership and cross-functional results easier to scan.',
      nextAction:
        'Add two or three achievements that connect directly to the roles you plan to pursue.',
      status: 'dismissed',
      priority: 4,
    },
    {
      id: 'issue-5',
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
      id: 'ats-1',
      type: 'parsing',
      label: 'Parsing risk',
      status: 'warning',
      reason: 'Columns may be read out of order by automated parsers.',
      nextAction: 'Use a single-column layout for experience and education.',
    },
    {
      id: 'ats-2',
      type: 'headings',
      label: 'Headings',
      status: 'pass',
      reason: 'Most section headings use standard resume language.',
      nextAction: 'Rename the portfolio section only if it contains role-critical projects.',
    },
    {
      id: 'ats-3',
      type: 'readability',
      label: 'Readability',
      status: 'warning',
      reason: 'Some bullets run long and bury the result at the end.',
      nextAction: 'Keep bullets to one or two lines with the result near the start.',
    },
    {
      id: 'ats-4',
      type: 'file_format',
      label: 'File format',
      status: 'pass',
      reason: 'The uploaded PDF format is supported for this analysis.',
      nextAction: 'Keep a DOCX version available if an employer asks for it.',
    },
  ] satisfies ATSCheck[],
  followUpPrompts: [
    'How should I rewrite the first experience bullet?',
    'Which keywords should I add for product analyst roles?',
  ],
  createdAt: '2026-04-30T10:00:00.000Z',
}

const hiringOutcomeClaims = [
  'interview',
  'callback',
  'offer',
  'hired',
  'guarantee',
  'recruiter will call',
]

const collectCopy = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectCopy)
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectCopy)
  }

  return []
}

const getReportIssueCategories = (report: DiagnosisReport): IssueCategory[] =>
  report.issues.flatMap((issue) => [
    issue.category,
    ...('additionalCategories' in issue ? issue.additionalCategories ?? [] : []),
  ])

describe('diagnosis domain types', () => {
  it('accepts an MVP diagnosis report fixture', () => {
    expect(report.overallScore).toBeGreaterThanOrEqual(0)
    expect(report.overallScore).toBeLessThanOrEqual(100)
    expect(report.summary.length).toBeGreaterThan(0)
    expect(report.issues).toHaveLength(5)
    expect(report.issues.map((issue) => issue.priority)).toEqual([1, 2, 3, 4, 5])

    report.issues.forEach((issue) => {
      expect(issue.severity).toMatch(/^(low|medium|high)$/)
      expect(allIssueCategories).toContain(issue.category)
      expect(issue.reason.length).toBeGreaterThan(0)
      expect(issue.nextAction.length).toBeGreaterThan(0)
      expect(issue.status).toMatch(/^(open|handled|dismissed)$/)
    })
  })

  it('supports the MVP issue and ATS category coverage', () => {
    expect(IssueSeverity).toEqual(['low', 'medium', 'high'])
    expect(IssueStatus).toEqual(['open', 'handled', 'dismissed'])
    expect(IssueCategory).toEqual(allIssueCategories)
    expect(ATSCheck.types).toEqual(['parsing', 'headings', 'readability', 'file_format'])

    expect(new Set(getReportIssueCategories(report))).toEqual(new Set(allIssueCategories))
    expect(allIssueCategories).toEqual([
      'content_clarity',
      'structure',
      'keywords',
      'missing_sections',
      'formatting',
      'ats_risk',
    ])
    expect(report.atsChecks.map((check) => check.type)).toEqual([
      'parsing',
      'headings',
      'readability',
      'file_format',
    ])
  })

  it('keeps mock report copy free of hiring outcome claims', () => {
    const reportCopy = collectCopy(report).join(' ').toLowerCase()

    hiringOutcomeClaims.forEach((claim) => {
      expect(reportCopy).not.toContain(claim)
    })
  })
})
