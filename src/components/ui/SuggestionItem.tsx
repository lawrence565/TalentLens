import React, { useState } from 'react'
import type { Analytics } from '../../services/analytics'
import { categoryLabels } from '../../types'
import type { IssueSeverity, IssueStatus, SuggestionItemProps } from '../../types'
import Button from './Button'

const severityClasses: Record<IssueSeverity, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-700',
}

const statusClasses: Record<IssueStatus, string> = {
  open: 'bg-gray-100 text-gray-700',
  handled: 'bg-emerald-100 text-emerald-700',
  dismissed: 'bg-slate-100 text-slate-600',
}

interface ExtendedSuggestionItemProps extends SuggestionItemProps {
  analytics?: Analytics
}

const SuggestionItem: React.FC<ExtendedSuggestionItemProps> = ({
  issue,
  reportId,
  onUpdateStatus,
  analytics,
}) => {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateStatus = async (status: Exclude<IssueStatus, 'open'>): Promise<void> => {
    setPending(true)
    setError(null)
    analytics?.issueInteracted({
      reportId,
      issueId: issue.id,
      action: status,
    })

    try {
      await onUpdateStatus(issue.id, status)
    } catch {
      setError('Could not update issue status. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <article
      aria-labelledby={`${issue.id}-title`}
      className="rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm"
    >
      <div className="flex items-start gap-4">
        <span className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-primary-500" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Priority {issue.priority}
            </p>
            <h3 id={`${issue.id}-title`} className="text-base font-semibold text-gray-900">
              {issue.title}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                severityClasses[issue.severity]
              }`}
            >
              {issue.severity}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                statusClasses[issue.status]
              }`}
            >
              Status: {issue.status}
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-primary-700">
            {categoryLabels[issue.category]}
          </p>
          <dl className="mt-3 grid gap-3 text-sm leading-6 text-gray-700">
            <div>
              <dt className="font-semibold text-gray-900">Reason</dt>
              <dd>{issue.reason}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Next action</dt>
              <dd>{issue.nextAction}</dd>
            </div>
          </dl>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => handleUpdateStatus('handled')}
            >
              Mark handled
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => handleUpdateStatus('dismissed')}
            >
              Dismiss issue
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default SuggestionItem
