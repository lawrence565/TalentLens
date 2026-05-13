import { FormEvent, useState } from 'react'
import type { Analytics } from '../../services/analytics'
import type { DiagnosisReport, FollowUpResponse } from '../../types'
import Button from '../ui/Button'
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
          <p className="font-sans text-sm font-semibold uppercase tracking-wide text-brand-600">
            Optional guidance
          </p>
          <h2 className="mt-2 font-sans text-xl font-bold text-n-900">Ask a follow-up</h2>
          <p className="mt-2 font-sans text-sm leading-6 text-n-600">
            Ask about one report issue when you need a more direct next step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="follow-up-issue" className="font-sans text-sm font-semibold text-n-800">
              Issue
            </label>
            <select
              id="follow-up-issue"
              value={selectedIssueId}
              onChange={(event) => setSelectedIssueId(event.target.value)}
              className="mt-2 w-full rounded-lg border-[1.5px] border-n-300 bg-white px-3 py-2 font-sans text-sm text-n-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-colors"
            >
              {report.issues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  {issue.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="follow-up-question" className="font-sans text-sm font-semibold text-n-800">
              Question
            </label>
            <textarea
              id="follow-up-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border-[1.5px] border-n-300 bg-white px-3 py-2 font-sans text-sm text-n-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-colors resize-y"
              placeholder="What should I fix first?"
            />
          </div>

          {error && (
            <p role="alert" className="font-sans text-sm font-medium text-high-500">
              {error}
            </p>
          )}

          <Button type="submit" disabled={!canSubmit} loading={isLoading}>
            {submitLabel}
          </Button>
        </form>

        {response && (
          <div className="mt-6 border-t border-n-200 pt-5" aria-live="polite">
            <h3 className="font-sans text-base font-semibold text-n-900">Direct answer</h3>
            <p className="mt-2 font-sans text-sm leading-6 text-n-700">{response.answer}</p>

            {hasItems(response.rewriteExamples) && (
              <div className="mt-5">
                <h3 className="font-sans text-base font-semibold text-n-900">Rewrite examples</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700">
                  {response.rewriteExamples.map((example) => (
                    <li key={example} className="rounded-lg bg-n-50 p-3 font-sans text-sm text-n-700">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasItems(response.nextActions) && (
              <div className="mt-5">
                <h3 className="font-sans text-base font-semibold text-n-900">Next actions</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 font-sans text-sm leading-6 text-n-700">
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
