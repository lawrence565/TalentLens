import type { DiagnosisReportDraft, DiagnosisProvider, ResumeRecord } from '../providers/diagnosisProvider'
import { fallbackDiagnosisProvider } from '../providers/fallbackDiagnosisProvider'
import type { TalentLensDatabase } from '../db/connection'
import { createId, nowIso } from '../shared/ids'

interface CreateAnalysisWorkerOptions {
  database: TalentLensDatabase
  provider?: DiagnosisProvider
}

interface AnalysisRow {
  id: string
  resume_id: string
}

interface ResumeRow {
  id: string
  file_name: string
  mime_type: string
  size: number
  upload_path: string
  created_at: string
}

const toResumeRecord = (row: ResumeRow): ResumeRecord => ({
  id: row.id,
  fileName: row.file_name,
  mimeType: row.mime_type,
  size: row.size,
  uploadPath: row.upload_path,
  createdAt: row.created_at,
})

const persistReport = (
  database: TalentLensDatabase,
  analysisId: string,
  resumeId: string,
  draft: DiagnosisReportDraft,
) => {
  const reportId = createId('report')
  const createdAt = nowIso()

  database.exec('begin immediate transaction')

  try {
    database
      .prepare(
        `insert into reports (
          id, resume_id, analysis_id, overall_score, summary, follow_up_prompts_json, created_at
        ) values (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        reportId,
        resumeId,
        analysisId,
        draft.overallScore,
        draft.summary,
        JSON.stringify(draft.followUpPrompts),
        createdAt,
      )

    for (const issue of draft.issues) {
      database
        .prepare(
          `insert into issues (
            id, report_id, title, severity, category, additional_categories_json,
            reason, next_action, status, priority
          ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          createId('issue'),
          reportId,
          issue.title,
          issue.severity,
          issue.category,
          issue.additionalCategories ? JSON.stringify(issue.additionalCategories) : null,
          issue.reason,
          issue.nextAction,
          issue.status,
          issue.priority,
        )
    }

    for (const check of draft.atsChecks) {
      database
        .prepare(
          `insert into ats_checks (
            id, report_id, type, label, status, reason, next_action
          ) values (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          createId('ats'),
          reportId,
          check.type,
          check.label,
          check.status,
          check.reason,
          check.nextAction,
        )
    }

    database
      .prepare(
        `update analyses
          set status = 'completed', progress = 100, error = null, completed_at = ?
          where id = ?`,
      )
      .run(createdAt, analysisId)
    database.exec('commit')
  } catch (error) {
    database.exec('rollback')
    throw error
  }
}

export const createAnalysisWorker = ({
  database,
  provider = fallbackDiagnosisProvider,
}: CreateAnalysisWorkerOptions) => ({
  async processNext(): Promise<boolean> {
    const analysis = database
      .prepare("select id, resume_id from analyses where status = 'queued' order by created_at limit 1")
      .get() as AnalysisRow | undefined

    if (!analysis) {
      return false
    }

    const startedAt = nowIso()
    database
      .prepare("update analyses set status = 'processing', progress = 40, started_at = ? where id = ?")
      .run(startedAt, analysis.id)

    try {
      const resume = database
        .prepare(
          `select id, file_name, mime_type, size, upload_path, created_at
            from resumes where id = ?`,
        )
        .get(analysis.resume_id) as ResumeRow | undefined

      if (!resume) {
        throw new Error('resume missing')
      }

      const draft = await provider.generateReport({
        resume: toResumeRecord(resume),
        analysisId: analysis.id,
      })

      persistReport(database, analysis.id, analysis.resume_id, draft)
      return true
    } catch {
      database
        .prepare(
          `update analyses
            set status = 'failed', progress = 100, error = 'Analysis failed. Please try again.', completed_at = ?
            where id = ?`,
        )
        .run(nowIso(), analysis.id)

      return true
    }
  },
})
