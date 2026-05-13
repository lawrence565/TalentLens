import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { DiagnosisReport } from '../../types'
import DiagnosisReportSection from './DiagnosisReportSection'

const report: DiagnosisReport = {
  id: 'report-1',
  resumeId: 'resume-1',
  analysisId: 'analysis-1',
  overallScore: 72,
  summary:
    'The resume has a clear foundation, but impact bullets, section order, and ATS readability need focused improvements before sharing it with employers.',
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
        'The strongest recent role is currently placed after less relevant sections.',
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
        'The resume underuses common product analytics terms for the target role.',
      nextAction:
        'Add accurate keywords from target job descriptions where they match your real experience.',
      status: 'open',
      priority: 3,
    },
    {
      id: 'issue-4',
      title: 'Simplify formatting for ATS parsing',
      severity: 'high',
      category: 'formatting',
      additionalCategories: ['ats_risk'],
      reason:
        'Dense columns may make headings and dates harder for resume parsers to read.',
      nextAction:
        'Use single-column sections, standard headings, and plain text bullets for the work-history area.',
      status: 'open',
      priority: 4,
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
      nextAction: 'Keep headings simple and familiar.',
    },
  ],
  followUpPrompts: [],
  createdAt: '2026-04-30T10:00:00.000Z',
}

describe('DiagnosisReportSection', () => {
  it('renders the assessment, summary, prioritized issues, and ATS checks without hiring-outcome claims', () => {
    render(<DiagnosisReportSection report={report} />)

    expect(
      screen.getByRole('heading', { name: /resume diagnosis report/i }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('score-value')).toHaveTextContent('72')
    expect(screen.getByText(/overall assessment/i)).toBeInTheDocument()
    expect(screen.getByText(report.summary)).toBeInTheDocument()
    expect(screen.getByText(/risks/i)).toHaveTextContent(
      /reduce clarity, scanability, or parser reliability/i,
    )

    const issues = screen.getByRole('list', { name: /top prioritized issues/i })
    const issueItems = within(issues).getAllByRole('listitem')

    expect(issueItems).toHaveLength(3)
    expect(issueItems[0]).toHaveTextContent('1')
    expect(issueItems[0]).toHaveTextContent('Lead with measurable impact')
    expect(issueItems[0]).toHaveTextContent(/high/i)
    expect(issueItems[0]).toHaveTextContent('Content clarity')
    expect(issueItems[0]).toHaveTextContent(report.issues[0].reason)
    expect(issueItems[0]).toHaveTextContent(report.issues[0].nextAction)
    expect(issueItems[1]).toHaveTextContent('Structure')
    expect(issueItems[2]).toHaveTextContent('Keywords')

    const atsChecks = screen.getByRole('list', { name: /ats checks/i })

    expect(within(atsChecks).getByText('Parsing risk')).toBeInTheDocument()
    expect(within(atsChecks).getByText(/warning/i)).toBeInTheDocument()
    expect(within(atsChecks).getByText(report.atsChecks[0].reason)).toBeInTheDocument()
    expect(within(atsChecks).getByText(report.atsChecks[0].nextAction)).toBeInTheDocument()
    expect(within(atsChecks).getByText('Headings')).toBeInTheDocument()
    expect(within(atsChecks).getByText(/pass/i)).toBeInTheDocument()

    const visibleCopy = document.body.textContent?.toLowerCase() ?? ''

    expect(visibleCopy).not.toMatch(/interviews?|callbacks?|offers?|hiring outcomes?|hired/)
  })
})
