import express from 'express'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import multer from 'multer'
import type { AnalyticsEvent } from '../../src/services/analytics'
import type { ATSCheck, DiagnosisIssue, DiagnosisReport, IssueStatus } from '../../src/types'
import type { TalentLensDatabase } from './db/connection'
import { asyncHandler, badRequest, conflict, errorHandler, notFound } from './shared/errors'
import {
  ensureBoolean,
  ensureRating,
  ensureString,
  MAX_RESUME_SIZE_BYTES,
  supportedIssueStatuses,
  supportedResumeMimeTypes,
} from './shared/validation'
import { createId, nowIso } from './shared/ids'

interface CreateAppOptions {
  database: TalentLensDatabase
  uploadDir: string
}

interface ReportRow {
  id: string
  resume_id: string
  analysis_id: string
  overall_score: number
  summary: string
  follow_up_prompts_json: string
  created_at: string
}

interface IssueRow {
  id: string
  title: string
  severity: DiagnosisIssue['severity']
  category: DiagnosisIssue['category']
  additional_categories_json: string | null
  reason: string
  next_action: string
  status: IssueStatus
  priority: number
}

interface ATSCheckRow {
  id: string
  type: ATSCheck['type']
  label: string
  status: ATSCheck['status']
  reason: string
  next_action: string
}

const toIssue = (row: IssueRow): DiagnosisIssue => ({
  id: row.id,
  title: row.title,
  severity: row.severity,
  category: row.category,
  additionalCategories: row.additional_categories_json
    ? (JSON.parse(row.additional_categories_json) as DiagnosisIssue['additionalCategories'])
    : undefined,
  reason: row.reason,
  nextAction: row.next_action,
  status: row.status,
  priority: row.priority,
})

const toATSCheck = (row: ATSCheckRow): ATSCheck => ({
  id: row.id,
  type: row.type,
  label: row.label,
  status: row.status,
  reason: row.reason,
  nextAction: row.next_action,
})

const getReport = (database: TalentLensDatabase, analysisId: string): DiagnosisReport | null => {
  const row = database
    .prepare(
      `select id, resume_id, analysis_id, overall_score, summary, follow_up_prompts_json, created_at
        from reports where analysis_id = ?`,
    )
    .get(analysisId) as ReportRow | undefined

  if (!row) {
    return null
  }

  const issues = database
    .prepare(
      `select id, title, severity, category, additional_categories_json, reason, next_action, status, priority
        from issues where report_id = ? order by priority`,
    )
    .all(row.id) as unknown as IssueRow[]
  const atsChecks = database
    .prepare(
      `select id, type, label, status, reason, next_action
        from ats_checks where report_id = ? order by rowid`,
    )
    .all(row.id) as unknown as ATSCheckRow[]

  return {
    id: row.id,
    resumeId: row.resume_id,
    analysisId: row.analysis_id,
    overallScore: row.overall_score,
    summary: row.summary,
    issues: issues.map(toIssue),
    atsChecks: atsChecks.map(toATSCheck),
    followUpPrompts: JSON.parse(row.follow_up_prompts_json) as string[],
    createdAt: row.created_at,
  }
}

const sanitizeAnalyticsPayload = (payload: unknown) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }

  const safePayload: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(payload)) {
    if (/resume.*content|raw.*resume|content/i.test(key)) {
      continue
    }

    safePayload[key] = value
  }

  return safePayload
}

const getRouteParam = (value: string | string[] | undefined, message: string) =>
  ensureString(Array.isArray(value) ? value[0] : value, message)

export const createApp = ({ database, uploadDir }: CreateAppOptions) => {
  mkdirSync(uploadDir, { recursive: true })

  const app = express()
  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadDir,
      filename: (_request, file, callback) => {
        callback(null, `${createId('upload')}-${file.originalname}`)
      },
    }),
    limits: { fileSize: MAX_RESUME_SIZE_BYTES },
    fileFilter: (_request, file, callback) => {
      if (!supportedResumeMimeTypes.has(file.mimetype)) {
        callback(badRequest('Upload a PDF, DOC, or DOCX resume.'))
        return
      }

      callback(null, true)
    },
  })

  app.use((request, response, next) => {
    const origin = request.headers.origin

    if (origin === 'http://localhost:5173') {
      response.setHeader('Access-Control-Allow-Origin', origin)
      response.setHeader('Vary', 'Origin')
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
    }

    if (request.method === 'OPTIONS') {
      response.sendStatus(204)
      return
    }

    next()
  })

  app.use(express.json({ limit: '64kb' }))

  app.post(
    '/api/resumes',
    upload.single('resume'),
    asyncHandler((request, response) => {
      if (!request.file) {
        throw badRequest('Upload a PDF, DOC, or DOCX resume.')
      }

      const resumeId = createId('resume')
      const uploadedAt = nowIso()

      database
        .prepare(
          `insert into resumes (id, file_name, mime_type, size, upload_path, created_at)
            values (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          resumeId,
          request.file.originalname,
          request.file.mimetype,
          request.file.size,
          request.file.path,
          uploadedAt,
        )

      response.status(201).json({
        resumeId,
        fileName: request.file.originalname,
        fileSize: request.file.size,
        fileType: request.file.mimetype,
        uploadedAt,
      })
    }),
  )

  app.post(
    '/api/resumes/:resumeId/analyses',
    asyncHandler((request, response) => {
      const resumeId = getRouteParam(request.params.resumeId, 'Resume not found.')
      const resume = database
        .prepare('select id from resumes where id = ?')
        .get(resumeId)

      if (!resume) {
        throw notFound('Resume not found.')
      }

      const analysisId = createId('analysis')
      database
        .prepare(
          `insert into analyses (id, resume_id, status, progress, created_at)
            values (?, ?, 'queued', 0, ?)`,
        )
        .run(analysisId, resumeId, nowIso())

      response.status(202).json({
        analysisId,
        resumeId,
        status: 'queued',
      })
    }),
  )

  app.get(
    '/api/analyses/:analysisId/progress',
    asyncHandler((request, response) => {
      const analysisId = getRouteParam(request.params.analysisId, 'Analysis not found.')
      const analysis = database
        .prepare('select id, status, progress, error from analyses where id = ?')
        .get(analysisId) as
        | { id: string; status: string; progress: number; error: string | null }
        | undefined

      if (!analysis) {
        throw notFound('Analysis not found.')
      }

      const report = database
        .prepare('select id from reports where analysis_id = ?')
        .get(analysisId) as { id: string } | undefined

      response.json({
        analysisId: analysis.id,
        status: analysis.status,
        progress: analysis.progress,
        estimatedSecondsRemaining: analysis.status === 'completed' ? 0 : 8,
        reportId: report?.id,
        error: analysis.error ?? undefined,
      })
    }),
  )

  app.get(
    '/api/analyses/:analysisId/report',
    asyncHandler((request, response) => {
      const analysisId = getRouteParam(request.params.analysisId, 'Analysis not found.')
      const analysis = database
        .prepare('select status from analyses where id = ?')
        .get(analysisId) as { status: string } | undefined

      if (!analysis) {
        throw notFound('Analysis not found.')
      }

      if (analysis.status !== 'completed') {
        throw conflict('Report is not ready.')
      }

      const report = getReport(database, analysisId)

      if (!report) {
        throw notFound('Report not found.')
      }

      response.json(report)
    }),
  )

  app.patch(
    '/api/issues/:issueId/status',
    asyncHandler((request, response) => {
      const issueId = getRouteParam(request.params.issueId, 'Issue not found.')
      const status = ensureString(request.body.status, 'Invalid issue status.') as IssueStatus

      if (!supportedIssueStatuses.has(status)) {
        throw badRequest('Invalid issue status.')
      }

      const issue = database
        .prepare(
          `select id, title, severity, category, additional_categories_json, reason,
            next_action, status, priority from issues where id = ?`,
        )
        .get(issueId) as IssueRow | undefined

      if (!issue) {
        throw notFound('Issue not found.')
      }

      database
        .prepare('update issues set status = ? where id = ?')
        .run(status, issueId)

      response.json(toIssue({ ...issue, status }))
    }),
  )

  app.post(
    '/api/reports/:reportId/follow-ups',
    asyncHandler((request, response) => {
      const reportId = getRouteParam(request.params.reportId, 'Report not found.')
      const report = database
        .prepare('select id from reports where id = ?')
        .get(reportId)

      if (!report) {
        throw notFound('Report not found.')
      }

      const question = ensureString(request.body.question, 'Question is required.')
      const issueId =
        typeof request.body.issueId === 'string' && request.body.issueId.trim().length > 0
          ? request.body.issueId.trim()
          : undefined
      const nextActions = [
        'Revise the most relevant bullet first.',
        'Check that the wording remains accurate to your experience.',
        'Keep the final wording concise and easy to scan.',
      ]
      const createdAt = nowIso()
      const id = createId('follow-up')
      const answer =
        'Start with one concrete change from the diagnosis, then review the surrounding section for clarity and consistency.'

      database
        .prepare(
          `insert into follow_ups (
            id, report_id, issue_id, question, answer, next_actions_json, created_at
          ) values (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          id,
          reportId,
          issueId ?? null,
          question,
          answer,
          JSON.stringify(nextActions),
          createdAt,
        )

      response.status(201).json({
        id,
        reportId,
        issueId,
        answer,
        nextActions,
        createdAt,
      })
    }),
  )

  app.post(
    '/api/reports/:reportId/ratings',
    asyncHandler((request, response) => {
      const reportId = getRouteParam(request.params.reportId, 'Report not found.')
      const report = database
        .prepare('select id from reports where id = ?')
        .get(reportId)

      if (!report) {
        throw notFound('Report not found.')
      }

      const rating = ensureRating(request.body.rating)
      const helpedUnderstandNextSteps = ensureBoolean(
        request.body.helpedUnderstandNextSteps,
        'Invalid rating payload.',
      )
      const feedback =
        typeof request.body.feedback === 'string' && request.body.feedback.trim().length > 0
          ? request.body.feedback.trim()
          : undefined
      const createdAt = nowIso()

      database
        .prepare(
          `insert into report_ratings (
            id, report_id, rating, helped_understand_next_steps, feedback, created_at
          ) values (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          createId('rating'),
          reportId,
          rating,
          helpedUnderstandNextSteps ? 1 : 0,
          feedback ?? null,
          createdAt,
        )

      response.status(201).json({
        reportId,
        rating,
        helpedUnderstandNextSteps,
        feedback,
        createdAt,
      })
    }),
  )

  app.post(
    '/api/analytics-events',
    asyncHandler((request, response) => {
      const event = request.body as Partial<AnalyticsEvent>
      const name = ensureString(event.name, 'Analytics event name is required.')

      database
        .prepare('insert into analytics_events (id, name, payload_json, created_at) values (?, ?, ?, ?)')
        .run(createId('event'), name, JSON.stringify(sanitizeAnalyticsPayload(event.payload)), nowIso())

      response.status(201).json({ ok: true })
    }),
  )

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true })
  })

  app.use('/uploads', express.static(join(uploadDir)))
  app.use(errorHandler)

  return app
}
