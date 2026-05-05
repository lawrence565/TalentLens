import { describe, expect, it, vi } from 'vitest'
import { createAnalytics, defaultAnalytics } from './analytics'
import type { AnalyticsEvent } from './analytics'

const uploadStartedEvent = {
  name: 'upload_started',
  payload: {
    fileType: 'application/pdf',
    fileSizeBytes: 12345,
  },
} satisfies AnalyticsEvent

const uploadCompletedEvent = {
  name: 'upload_completed',
  payload: {
    resumeId: 'resume-1',
    analysisId: 'analysis-1',
    durationMs: 900,
  },
} satisfies AnalyticsEvent

const reportViewedEvent = {
  name: 'report_viewed',
  payload: {
    reportId: 'report-1',
    analysisId: 'analysis-1',
  },
} satisfies AnalyticsEvent

const issueInteractedEvent = {
  name: 'issue_interacted',
  payload: {
    reportId: 'report-1',
    issueId: 'issue-1',
    action: 'handled',
  },
} satisfies AnalyticsEvent

const followUpAskedEvent = {
  name: 'follow_up_asked',
  payload: {
    reportId: 'report-1',
    issueId: 'issue-1',
    questionLength: 42,
  },
} satisfies AnalyticsEvent

const timeToReportMeasuredEvent = {
  name: 'time_to_report_measured',
  payload: {
    reportId: 'report-1',
    durationMs: 1500,
  },
} satisfies AnalyticsEvent

const reportHelpfulnessRatingSubmittedEvent = {
  name: 'report_helpfulness_rating_submitted',
  payload: {
    reportId: 'report-1',
    rating: 5,
  },
} satisfies AnalyticsEvent

const allEvents = [
  uploadStartedEvent,
  uploadCompletedEvent,
  reportViewedEvent,
  issueInteractedEvent,
  followUpAskedEvent,
  timeToReportMeasuredEvent,
  reportHelpfulnessRatingSubmittedEvent,
] satisfies AnalyticsEvent[]

describe('analytics', () => {
  it('exposes a default no-op adapter that does not call network APIs', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const sendBeaconSpy = vi.fn()
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeaconSpy,
    })

    defaultAnalytics.uploadStarted({
      fileType: 'application/pdf',
      fileSizeBytes: 12345,
    })
    defaultAnalytics.uploadCompleted({
      resumeId: 'resume-1',
      analysisId: 'analysis-1',
      durationMs: 900,
    })
    defaultAnalytics.reportViewed({
      reportId: 'report-1',
      analysisId: 'analysis-1',
    })
    defaultAnalytics.issueInteracted({
      reportId: 'report-1',
      issueId: 'issue-1',
      action: 'handled',
    })
    defaultAnalytics.followUpAsked({
      reportId: 'report-1',
      issueId: 'issue-1',
      questionLength: 42,
    })
    defaultAnalytics.timeToReportMeasured({
      reportId: 'report-1',
      durationMs: 1500,
    })
    defaultAnalytics.reportHelpfulnessRatingSubmitted({
      reportId: 'report-1',
      rating: 5,
    })

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(sendBeaconSpy).not.toHaveBeenCalled()
  })

  it('can be replaced with an adapter that receives typed MVP events', () => {
    const track = vi.fn()
    const analytics = createAnalytics({ track })

    analytics.uploadStarted(uploadStartedEvent.payload)
    analytics.uploadCompleted(uploadCompletedEvent.payload)
    analytics.reportViewed(reportViewedEvent.payload)
    analytics.issueInteracted(issueInteractedEvent.payload)
    analytics.followUpAsked(followUpAskedEvent.payload)
    analytics.timeToReportMeasured(timeToReportMeasuredEvent.payload)
    analytics.reportHelpfulnessRatingSubmitted(reportHelpfulnessRatingSubmittedEvent.payload)

    expect(track).toHaveBeenCalledTimes(allEvents.length)
    expect(track.mock.calls.map(([event]) => event)).toEqual(allEvents)
  })
})
