import React from 'react'
import type { Analytics } from '../../services/analytics'
import type { DiagnosisIssue, DiagnosisReport, IssueStatus } from '../../types'
import SuggestionItem from '../ui/SuggestionItem'

interface SuggestionsSectionProps {
  report: DiagnosisReport
  updateIssueStatus: (
    issueId: string,
    status: IssueStatus,
  ) => void | Promise<DiagnosisIssue>
  analytics?: Analytics
}

const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  report,
  updateIssueStatus,
  analytics,
}) => (
  <section className="mx-auto max-w-4xl px-6 pb-16">
    <div className="mb-6">
      <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
        All issues
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-n-900">Issue actions</h2>
      <p className="mt-3 text-sm leading-6 text-n-600">{report.summary}</p>
    </div>

    <div className="space-y-4">
      {report.issues.map((issue) => (
        <SuggestionItem
          key={issue.id}
          issue={issue}
          reportId={report.id}
          onUpdateStatus={updateIssueStatus}
          analytics={analytics}
        />
      ))}
    </div>
  </section>
)

export default SuggestionsSection
