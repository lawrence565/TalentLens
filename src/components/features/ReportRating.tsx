import { FormEvent, useState } from 'react'
import type { Analytics } from '../../services/analytics'
import { defaultAnalytics } from '../../services/analytics'
import Card from '../ui/Card'

type RatingOption = {
  label: string
  value: 1 | 3 | 5
}

interface ReportRatingProps {
  reportId: string
  analytics?: Analytics
}

const ratingOptions: RatingOption[] = [
  { label: 'Yes', value: 5 },
  { label: 'Somewhat', value: 3 },
  { label: 'Not really', value: 1 },
]

const ReportRating: React.FC<ReportRatingProps> = ({
  reportId,
  analytics = defaultAnalytics,
}) => {
  const [rating, setRating] = useState<RatingOption['value'] | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (!rating) {
      return
    }

    analytics.reportHelpfulnessRatingSubmitted({
      reportId,
      rating,
    })
    setSubmitted(true)
  }

  return (
    <section className="mx-auto max-w-4xl px-6 pb-8">
      <Card className="p-5 shadow-none">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Quick feedback
              </p>
              <h2 className="mt-1 text-base font-semibold text-gray-900">
                Was this report helpful?
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Did this help you understand what to fix next?
              </p>
            </div>

            <div>
              <fieldset className="flex flex-wrap gap-2" disabled={submitted}>
                <legend className="sr-only">
                  Did this report help you understand what to fix?
                </legend>
                {ratingOptions.map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700"
                  >
                    <input
                      type="radio"
                      name="report-helpfulness-rating"
                      value={option.value}
                      checked={rating === option.value}
                      onChange={() => setRating(option.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    {option.label}
                  </label>
                ))}
              </fieldset>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!rating || submitted}
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Submit rating
                </button>
                {submitted && (
                  <p className="text-sm font-medium text-primary-700" aria-live="polite">
                    Thanks for the feedback.
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </Card>
    </section>
  )
}

export default ReportRating
