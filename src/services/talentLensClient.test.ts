import { describe, expect, it } from 'vitest'
import { createMockTalentLensClient } from './mockTalentLensClient'

const makeFile = (name: string, type: string, content = 'resume content') =>
  new File([content], name, { type })

const hiringOutcomeClaims = [
  'interview',
  'callback',
  'offer',
  'hired',
  'guarantee',
  'recruiter will call',
]

const collectCopy = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectCopy)
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectCopy)
  }

  return []
}

describe('createMockTalentLensClient', () => {
  it('accepts PDF, DOC, and DOCX resume uploads', async () => {
    const client = createMockTalentLensClient()

    await expect(client.uploadResume(makeFile('resume.pdf', 'application/pdf'))).resolves.toMatchObject({
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
    })
    await expect(client.uploadResume(makeFile('resume.doc', 'application/msword'))).resolves.toMatchObject({
      fileName: 'resume.doc',
      fileType: 'application/msword',
    })
    await expect(
      client.uploadResume(
        makeFile(
          'resume.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ),
    ).resolves.toMatchObject({
      fileName: 'resume.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
  })

  it('rejects invalid file types with a clear error', async () => {
    const client = createMockTalentLensClient()

    await expect(client.uploadResume(makeFile('resume.txt', 'text/plain'))).rejects.toThrow(
      'Upload a PDF, DOC, or DOCX resume.',
    )
  })

  it('returns deterministic resume IDs from file metadata', async () => {
    const client = createMockTalentLensClient()
    const firstUpload = await client.uploadResume(makeFile('My Resume.PDF', 'application/pdf'))
    const secondUpload = await client.uploadResume(makeFile('My Resume.PDF', 'application/pdf'))

    expect(firstUpload.resumeId).toBe('resume-my-resume-pdf-14')
    expect(secondUpload.resumeId).toBe(firstUpload.resumeId)
  })

  it('starts analysis from a resume ID', async () => {
    const client = createMockTalentLensClient()
    const upload = await client.uploadResume(makeFile('resume.pdf', 'application/pdf'))
    const analysis = await client.startAnalysis(upload.resumeId)

    expect(analysis).toEqual({
      analysisId: 'analysis-resume-resume-pdf-14',
      resumeId: upload.resumeId,
      status: 'processing',
    })
  })

  it('returns analysis progress with estimated seconds remaining', async () => {
    const client = createMockTalentLensClient()
    const upload = await client.uploadResume(makeFile('resume.pdf', 'application/pdf'))
    const analysis = await client.startAnalysis(upload.resumeId)
    const progress = await client.getAnalysisProgress(analysis.analysisId)

    expect(progress).toEqual({
      analysisId: analysis.analysisId,
      status: 'completed',
      progress: 100,
      estimatedSecondsRemaining: 0,
      reportId: 'report-resume-resume-pdf-14',
    })
  })

  it('returns a diagnosis report without hiring-outcome claims', async () => {
    const client = createMockTalentLensClient()
    const upload = await client.uploadResume(makeFile('resume.pdf', 'application/pdf'))
    const analysis = await client.startAnalysis(upload.resumeId)
    const report = await client.getDiagnosisReport(analysis.analysisId)
    const reportCopy = collectCopy(report).join(' ').toLowerCase()

    expect(report).toMatchObject({
      id: 'report-resume-resume-pdf-14',
      resumeId: upload.resumeId,
      analysisId: analysis.analysisId,
    })
    expect(report.issues).toHaveLength(5)
    expect(report.atsChecks).toHaveLength(4)

    hiringOutcomeClaims.forEach((claim) => {
      expect(reportCopy).not.toContain(claim)
    })
  })

  it('updates issue status to handled and dismissed', async () => {
    const client = createMockTalentLensClient()
    const upload = await client.uploadResume(makeFile('resume.pdf', 'application/pdf'))
    const analysis = await client.startAnalysis(upload.resumeId)
    const report = await client.getDiagnosisReport(analysis.analysisId)

    await expect(client.updateIssueStatus(report.issues[0].id, 'handled')).resolves.toMatchObject({
      id: report.issues[0].id,
      status: 'handled',
    })
    await expect(client.updateIssueStatus(report.issues[1].id, 'dismissed')).resolves.toMatchObject({
      id: report.issues[1].id,
      status: 'dismissed',
    })
  })

  it('returns follow-up guidance for a report question', async () => {
    const client = createMockTalentLensClient()
    const upload = await client.uploadResume(makeFile('resume.pdf', 'application/pdf'))
    const analysis = await client.startAnalysis(upload.resumeId)
    const report = await client.getDiagnosisReport(analysis.analysisId)
    const response = await client.askFollowUp({
      reportId: report.id,
      issueId: report.issues[0].id,
      question: 'How should I improve this bullet?',
    })

    expect(response).toMatchObject({
      id: `follow-up-${report.id}-${report.issues[0].id}`,
      reportId: report.id,
      issueId: report.issues[0].id,
    })
    expect(response.answer).toContain('Use the issue context')
    expect(response.nextActions.length).toBeGreaterThan(0)
  })

  it('does not include raw file content in error messages', async () => {
    const client = createMockTalentLensClient()
    const rawResumeContent = 'SECRET RAW RESUME CONTENT'

    await expect(
      client.uploadResume(makeFile('resume.txt', 'text/plain', rawResumeContent)),
    ).rejects.not.toThrow(rawResumeContent)
  })
})
