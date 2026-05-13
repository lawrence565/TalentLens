import React, { useState } from 'react'
import type { Analytics } from '../../services/analytics'
import { categoryLabels } from '../../types'
import type { IssueSeverity, IssueStatus, SuggestionItemProps } from '../../types'
import Badge from './Badge'
import Button from './Button'
import SeverityDot from './SeverityDot'

const severityBarClass: Record<IssueSeverity, string> = {
  high:   'bg-high-500',
  medium: 'bg-med-500',
  low:    'bg-low-500',
}

const statusVariant: Record<IssueStatus, 'handled' | 'dismissed' | 'default'> = {
  open:      'default',
  handled:   'handled',
  dismissed: 'dismissed',
}

const statusLabel: Record<IssueStatus, string> = {
  open:      'Open',
  handled:   'Handled',
  dismissed: 'Dismissed',
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
  const [status, setStatus] = useState<IssueStatus>(issue.status)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSettled = status !== 'open'

  const handleUpdateStatus = async (next: Exclude<IssueStatus, 'open'>): Promise<void> => {
    setPending(true)
    setError(null)
    try {
      await onUpdateStatus(issue.id, next)
      analytics?.issueInteracted({ reportId, issueId: issue.id, action: next })
      setStatus(next)
    } catch {
      setError('Could not update issue status. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const outerClass = [
    'relative overflow-hidden rounded-[14px] border border-n-200 pl-6 pr-5 py-5 text-left transition-all duration-200',
    status === 'handled' ? 'bg-low-50' : status === 'dismissed' ? 'bg-n-50 opacity-65' : 'bg-white',
  ].join(' ')

  return (
    <article aria-labelledby={`${issue.id}-title`} className={outerClass}>
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[14px] ${
          isSettled ? 'bg-n-300' : severityBarClass[issue.severity]
        }`}
      />

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-mono text-[10px] font-semibold tracking-[0.05em] text-n-400">
          P{issue.priority}
        </span>
        <h3
          id={`${issue.id}-title`}
          className={`font-sans text-sm font-bold ${isSettled ? 'text-n-500' : 'text-n-900'}`}
        >
          {issue.title}
        </h3>
        <Badge variant={issue.severity}>
          <SeverityDot level={issue.severity} />
          {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
        </Badge>
        <Badge
          variant={statusVariant[status]}
          data-testid="issue-status"
        >
          {statusLabel[status]}
        </Badge>
      </div>

      <Badge variant="brand" size="xs">{categoryLabels[issue.category]}</Badge>

      <dl className="mt-3.5 grid gap-2.5 text-sm leading-6">
        <div>
          <dt className="inline font-semibold text-n-800">Reason: </dt>
          <dd className="inline text-n-600">{issue.reason}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-n-800">Next action: </dt>
          <dd className="inline text-n-600">{issue.nextAction}</dd>
        </div>
      </dl>

      {error && (
        <p role="alert" className="mt-3 font-sans text-sm font-medium text-high-500">
          {error}
        </p>
      )}

      {status === 'open' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" disabled={pending} onClick={() => handleUpdateStatus('handled')}>
            Mark handled
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => handleUpdateStatus('dismissed')}>
            Dismiss issue
          </Button>
        </div>
      )}
    </article>
  )
}

export default SuggestionItem
