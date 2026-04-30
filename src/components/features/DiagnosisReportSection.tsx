import { categoryLabels } from '../../types'
import type { DiagnosisIssue, DiagnosisReport } from '../../types'
import Card from '../ui/Card'

interface DiagnosisReportSectionProps {
  report: DiagnosisReport
}

const getAssessment = (score: number): string => {
  if (score >= 85) {
    return 'Strong foundation'
  }

  if (score >= 70) {
    return 'Focused improvements needed'
  }

  return 'High-priority review needed'
}

const getIssueCategories = (issue: DiagnosisIssue): string[] => [
  categoryLabels[issue.category],
  ...(issue.additionalCategories ?? []).map((category) => categoryLabels[category]),
]

const DiagnosisReportSection: React.FC<DiagnosisReportSectionProps> = ({ report }) => {
  const topIssues = [...report.issues]
    .sort((firstIssue, secondIssue) => firstIssue.priority - secondIssue.priority)
    .slice(0, 3)

  return (
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-primary-600">
          Overall assessment
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
          Resume diagnosis report
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Overall score</p>
            <p className="mt-3 text-5xl font-semibold text-gray-900">{report.overallScore}</p>
            <p className="mt-2 text-sm font-medium text-gray-700">
              {getAssessment(report.overallScore)}
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
          <p className="mt-3 text-sm leading-6 text-gray-700">{report.summary}</p>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            These risks can reduce clarity, scanability, or parser reliability.
            Use the next actions as review priorities before sending this resume.
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900">Top prioritized issues</h3>
          <ul aria-label="Top prioritized issues" className="mt-4 space-y-4">
            {topIssues.map((issue) => (
              <li key={issue.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Priority {issue.priority}
                    </p>
                    <h4 className="mt-1 text-base font-semibold text-gray-900">
                      {issue.title}
                    </h4>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-700">
                    {issue.severity}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {getIssueCategories(issue).map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <dl className="mt-4 grid gap-3 text-sm leading-6 text-gray-700">
                  <div>
                    <dt className="font-semibold text-gray-900">Reason</dt>
                    <dd>{issue.reason}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">Next action</dt>
                    <dd>{issue.nextAction}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900">ATS checks</h3>
          <ul aria-label="ATS checks" className="mt-4 space-y-4">
            {report.atsChecks.map((check) => (
              <li key={check.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">{check.label}</h4>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-700">
                    {check.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-700">{check.reason}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">{check.nextAction}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  )
}

export default DiagnosisReportSection
