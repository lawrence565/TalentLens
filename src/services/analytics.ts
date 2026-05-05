export type UploadStartedEvent = {
  name: 'upload_started'
  payload: {
    fileType: string
    fileSizeBytes: number
  }
}

export type UploadCompletedEvent = {
  name: 'upload_completed'
  payload: {
    resumeId: string
    analysisId: string
    durationMs?: number
  }
}

export type ReportViewedEvent = {
  name: 'report_viewed'
  payload: {
    reportId: string
    analysisId?: string
  }
}

export type IssueInteractedEvent = {
  name: 'issue_interacted'
  payload: {
    reportId: string
    issueId: string
    action: 'viewed' | 'handled' | 'dismissed' | 'reopened' | 'copied_suggestion'
  }
}

export type FollowUpAskedEvent = {
  name: 'follow_up_asked'
  payload: {
    reportId: string
    issueId?: string
    questionLength: number
  }
}

export type TimeToReportMeasuredEvent = {
  name: 'time_to_report_measured'
  payload: {
    reportId: string
    durationMs: number
  }
}

export type ReportHelpfulnessRatingSubmittedEvent = {
  name: 'report_helpfulness_rating_submitted'
  payload: {
    reportId: string
    rating: 1 | 2 | 3 | 4 | 5
  }
}

export type AnalyticsEvent =
  | UploadStartedEvent
  | UploadCompletedEvent
  | ReportViewedEvent
  | IssueInteractedEvent
  | FollowUpAskedEvent
  | TimeToReportMeasuredEvent
  | ReportHelpfulnessRatingSubmittedEvent

export interface AnalyticsAdapter {
  track(event: AnalyticsEvent): void
}

export interface Analytics {
  uploadStarted(payload: UploadStartedEvent['payload']): void
  uploadCompleted(payload: UploadCompletedEvent['payload']): void
  reportViewed(payload: ReportViewedEvent['payload']): void
  issueInteracted(payload: IssueInteractedEvent['payload']): void
  followUpAsked(payload: FollowUpAskedEvent['payload']): void
  timeToReportMeasured(payload: TimeToReportMeasuredEvent['payload']): void
  reportHelpfulnessRatingSubmitted(
    payload: ReportHelpfulnessRatingSubmittedEvent['payload'],
  ): void
}

const noopAdapter: AnalyticsAdapter = {
  track: () => {},
}

export const createAnalytics = (adapter: AnalyticsAdapter = noopAdapter): Analytics => ({
  uploadStarted: (payload) => adapter.track({ name: 'upload_started', payload }),
  uploadCompleted: (payload) => adapter.track({ name: 'upload_completed', payload }),
  reportViewed: (payload) => adapter.track({ name: 'report_viewed', payload }),
  issueInteracted: (payload) => adapter.track({ name: 'issue_interacted', payload }),
  followUpAsked: (payload) => adapter.track({ name: 'follow_up_asked', payload }),
  timeToReportMeasured: (payload) => adapter.track({ name: 'time_to_report_measured', payload }),
  reportHelpfulnessRatingSubmitted: (payload) =>
    adapter.track({ name: 'report_helpfulness_rating_submitted', payload }),
})

export const defaultAnalytics = createAnalytics()
