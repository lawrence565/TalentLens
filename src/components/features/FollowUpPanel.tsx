import { FormEvent, useState } from 'react'
import type { Analytics } from '../../services/analytics'
import type { DiagnosisReport, FollowUpResponse } from '../../types'
import Card from '../ui/Card'

type FollowUpPanelResponse = FollowUpResponse & {
  rewriteExamples?: string[]
}

interface FollowUpPanelProps {
  report: DiagnosisReport
  followUpResponse: FollowUpPanelResponse | null
  askFollowUp: (input: {
    issueId?: string
    question: string
  }) => Promise<FollowUpResponse>
  analytics?: Analytics
}

const FAILURE_MESSAGE = 'Follow-up failed. Please try again.'

const hasItems = (items: string[] | undefined): items is string[] =>
  Array.isArray(items) && items.length > 0

const FollowUpPanel: React.FC<FollowUpPanelProps> = ({
  report,
  followUpResponse,
  askFollowUp,
  analytics,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState(report.issues[0]?.id ?? '')
  const [question, setQuestion] = useState('')
  const [localResponse, setLocalResponse] = useState<FollowUpPanelResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const response = followUpResponse ?? localResponse
  const trimmedQuestion = question.trim()
  const canSubmit = trimmedQuestion.length > 0 && !isLoading
  const submitLabel = isLoading ? 'Asking...' : error ? 'Try again' : 'Ask follow-up'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const nextResponse = await askFollowUp({
        issueId: selectedIssueId || undefined,
        question: trimmedQuestion,
      })
      analytics?.followUpAsked({
        reportId: report.id,
        issueId: selectedIssueId || undefined,
        questionLength: trimmedQuestion.length,
      })
      setLocalResponse(nextResponse as FollowUpPanelResponse)
    } catch {
      setError(FAILURE_MESSAGE)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 pb-16">
      <Card>
        <div className="mb-5">
          <p className="text-sm font-medium uppercase tracking-wide text-primary-600">
            Optional guidance
          </p>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">Ask a follow-up</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Ask about one report issue when you need a more direct next step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="follow-up-issue" className="text-sm font-medium text-gray-800">
              Issue
            </label>
            <select
              id="follow-up-issue"
              value={selectedIssueId}
              onChange={(event) => setSelectedIssueId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {report.issues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  {issue.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="follow-up-question" className="text-sm font-medium text-gray-800">
              Question
            </label>
            <textarea
              id="follow-up-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="What should I fix first?"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </form>

        {response && (
          <div className="mt-6 border-t border-gray-200 pt-5" aria-live="polite">
            <h3 className="text-base font-semibold text-gray-900">Direct answer</h3>
            <p className="mt-2 text-sm leading-6 text-gray-700">{response.answer}</p>

            {hasItems(response.rewriteExamples) && (
              <div className="mt-5">
                <h3 className="text-base font-semibold text-gray-900">Rewrite examples</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                  {response.rewriteExamples.map((example) => (
                    <li key={example} className="rounded-lg bg-gray-50 p-3">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasItems(response.nextActions) && (
              <div className="mt-5">
                <h3 className="text-base font-semibold text-gray-900">Next actions</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
                  {response.nextActions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </section>
  )
}

export default FollowUpPanel
