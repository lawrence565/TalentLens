import React from 'react'
import { categoryLabels } from '../../types'
import type { ATSCheck, DiagnosisIssue, DiagnosisReport } from '../../types'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import ScoreRing from '../ui/ScoreRing'
import SeverityDot from '../ui/SeverityDot'

interface DiagnosisReportSectionProps {
  report: DiagnosisReport
}

const getAssessment = (score: number): string => {
  if (score >= 85) return 'Strong foundation'
  if (score >= 70) return 'Focused improvements needed'
  return 'High-priority review needed'
}

const getIssueCategories = (issue: DiagnosisIssue): string[] => [
  categoryLabels[issue.category],
  ...(issue.additionalCategories ?? []).map((c) => categoryLabels[c]),
]

const ATSStatusIcon: React.FC<{ status: ATSCheck['status'] }> = ({ status }) => {
  if (status === 'pass') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="text-low-500">
        <path d="M5 13l4 4L19 7" />
      </svg>
    )
  }
  if (status === 'warning') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="text-med-500">
        <path d="M12 9v4M12 17h.01M10.3 4.8L3 17.3A2 2 0 005 20h14a2 2 0 001.7-3.1L13.7 4.8a2 2 0 00-3.4 0z" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="text-high-500">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

const atsContainerClass: Record<ATSCheck['status'], string> = {
  pass:    'bg-low-50 border border-low-100',
  warning: 'bg-med-50 border border-med-100',
  fail:    'bg-high-50 border border-high-100',
}

const atsIconBgClass: Record<ATSCheck['status'], string> = {
  pass:    'bg-low-100',
  warning: 'bg-med-100',
  fail:    'bg-high-100',
}

const atsTitleClass: Record<ATSCheck['status'], string> = {
  pass:    'text-low-700',
  warning: 'text-med-700',
  fail:    'text-high-700',
}

const DiagnosisReportSection: React.FC<DiagnosisReportSectionProps> = ({ report }) => {
  const topIssues = [...report.issues]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)

  return (
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <div className="mb-6">
        <p className="font-sans text-sm font-semibold uppercase tracking-wide text-brand-600">
          Overall assessment
        </p>
        <h2 className="mt-2 font-sans text-2xl font-bold text-n-900">
          Resume diagnosis report
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <Card className="flex flex-col items-center justify-center gap-3">
          <ScoreRing score={report.overallScore} size={160} />
          <p className="font-sans text-sm font-medium text-n-600 text-center">
            {getAssessment(report.overallScore)}
          </p>
        </Card>

        <Card>
          <h3 className="font-sans text-lg font-semibold text-n-900">Summary</h3>
          <p className="mt-3 font-sans text-sm leading-6 text-n-700">{report.summary}</p>
          <p className="mt-4 font-sans text-sm leading-6 text-n-600">
            These risks can reduce clarity, scanability, or parser reliability.
            Use the next actions as review priorities before sending this resume.
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h3 className="font-sans text-lg font-semibold text-n-900">Top prioritized issues</h3>
          <ul aria-label="Top prioritized issues" className="mt-4 space-y-3">
            {topIssues.map((issue) => (
              <li key={issue.id} className="relative rounded-xl border border-n-200 bg-white pl-5 pr-4 py-4 overflow-hidden">
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                    issue.severity === 'high' ? 'bg-high-500' : issue.severity === 'medium' ? 'bg-med-500' : 'bg-low-500'
                  }`}
                />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-n-400">
                      Priority {issue.priority}
                    </p>
                    <h4 className="mt-1 font-sans text-sm font-bold text-n-900">{issue.title}</h4>
                  </div>
                  <Badge variant={issue.severity}>
                    <SeverityDot level={issue.severity} />
                    {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {getIssueCategories(issue).map((cat) => (
                    <Badge key={cat} variant="brand" size="xs">{cat}</Badge>
                  ))}
                </div>

                <dl className="mt-3 grid gap-2 text-sm leading-6 text-n-700">
                  <div>
                    <dt className="inline font-semibold text-n-800">Reason: </dt>
                    <dd className="inline">{issue.reason}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-n-800">Next action: </dt>
                    <dd className="inline">{issue.nextAction}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="font-sans text-lg font-semibold text-n-900">ATS checks</h3>
          <ul aria-label="ATS checks" className="mt-4 space-y-3">
            {report.atsChecks.map((check) => (
              <li key={check.id} className={`rounded-xl p-[18px] flex gap-3.5 ${atsContainerClass[check.status]}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${atsIconBgClass[check.status]}`}>
                  <ATSStatusIcon status={check.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`font-sans text-sm font-bold ${atsTitleClass[check.status]}`}>
                      {check.label}
                    </span>
                    <Badge variant={check.status}>
                      {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="font-sans text-xs text-n-600 leading-relaxed">{check.reason}</p>
                  {check.nextAction && (
                    <p className="font-sans text-xs text-n-500 leading-relaxed mt-1">{check.nextAction}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  )
}

export default DiagnosisReportSection
