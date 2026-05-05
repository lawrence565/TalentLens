// @vitest-environment node
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import type { Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import request from 'supertest'
import { createApp } from './app'
import { createDatabase } from './db/connection'
import { migrateDatabase } from './db/migrate'
import { createAnalysisWorker } from './analyses/analysisWorker'

const createTempRuntime = async () => {
  const root = await mkdtemp(join(tmpdir(), 'talentlens-test-'))
  const uploadDir = join(root, 'uploads')
  await mkdir(uploadDir, { recursive: true })
  const database = createDatabase(':memory:')
  migrateDatabase(database)

  return { root, uploadDir, database }
}

describe('TalentLens API', () => {
  let runtime: Awaited<ReturnType<typeof createTempRuntime>>
  let server: Server | null = null

  beforeEach(async () => {
    runtime = await createTempRuntime()
  })

  afterEach(async () => {
    if (server) {
      const activeServer = server
      await new Promise<void>((resolve, reject) => {
        activeServer.close((error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
      server = null
    }

    runtime.database.close()
    await rm(runtime.root, { recursive: true, force: true })
  })

  test('accepts PDF, DOC, and DOCX uploads and rejects unsafe uploads', async () => {
    server = createApp({ database: runtime.database, uploadDir: runtime.uploadDir }).listen(0)

    for (const [fileName, mimeType] of [
      ['resume.pdf', 'application/pdf'],
      ['resume.doc', 'application/msword'],
      ['resume.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ] as const) {
      const response = await request(server)
        .post('/api/resumes')
        .attach('resume', Buffer.from('resume file'), { filename: fileName, contentType: mimeType })
        .expect(201)

      expect(response.body).toMatchObject({
        fileName,
        fileType: mimeType,
        fileSize: 11,
      })
      expect(response.body.resumeId).toEqual(expect.any(String))
    }

    const rejected = await request(server)
      .post('/api/resumes')
      .attach('resume', Buffer.from('raw private resume content'), {
        filename: 'resume.txt',
        contentType: 'text/plain',
      })
      .expect(400)

    expect(JSON.stringify(rejected.body)).not.toContain('raw private resume content')
  })

  test('allows the local frontend origin to call the API', async () => {
    server = createApp({ database: runtime.database, uploadDir: runtime.uploadDir }).listen(0)

    const response = await request(server)
      .options('/api/health')
      .set('Origin', 'http://localhost:5173')
      .expect(204)

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(response.headers['access-control-allow-methods']).toContain('POST')
  })

  test('moves an analysis from queued to completed and returns a frontend-compatible report', async () => {
    server = createApp({ database: runtime.database, uploadDir: runtime.uploadDir }).listen(0)
    const upload = await request(server)
      .post('/api/resumes')
      .attach('resume', Buffer.from('resume file'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      })
      .expect(201)

    const created = await request(server)
      .post(`/api/resumes/${upload.body.resumeId}/analyses`)
      .expect(202)

    expect(created.body).toMatchObject({
      resumeId: upload.body.resumeId,
      status: 'queued',
    })

    await request(server)
      .get(`/api/analyses/${created.body.analysisId}/report`)
      .expect(409)

    const worker = createAnalysisWorker({ database: runtime.database })
    await worker.processNext()

    const progress = await request(server)
      .get(`/api/analyses/${created.body.analysisId}/progress`)
      .expect(200)

    expect(progress.body).toMatchObject({
      analysisId: created.body.analysisId,
      status: 'completed',
      progress: 100,
      estimatedSecondsRemaining: 0,
      reportId: expect.any(String),
    })

    const report = await request(server)
      .get(`/api/analyses/${created.body.analysisId}/report`)
      .expect(200)

    expect(report.body).toMatchObject({
      id: progress.body.reportId,
      resumeId: upload.body.resumeId,
      analysisId: created.body.analysisId,
      overallScore: expect.any(Number),
      summary: expect.any(String),
      createdAt: expect.any(String),
    })
    expect(report.body.issues).toHaveLength(5)
    expect(report.body.issues[0]).toMatchObject({
      status: 'open',
      priority: 1,
      title: expect.any(String),
      severity: expect.stringMatching(/^(low|medium|high)$/),
    })
    expect(report.body.atsChecks.map((check: { type: string }) => check.type)).toEqual([
      'parsing',
      'headings',
      'readability',
      'file_format',
    ])
    expect(report.body.followUpPrompts.length).toBeGreaterThan(0)
  })

  test('persists issue status updates, follow-ups, report ratings, and analytics events', async () => {
    server = createApp({ database: runtime.database, uploadDir: runtime.uploadDir }).listen(0)
    const upload = await request(server)
      .post('/api/resumes')
      .attach('resume', Buffer.from('resume file'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      })
      .expect(201)
    const created = await request(server)
      .post(`/api/resumes/${upload.body.resumeId}/analyses`)
      .expect(202)
    await createAnalysisWorker({ database: runtime.database }).processNext()
    const report = await request(server)
      .get(`/api/analyses/${created.body.analysisId}/report`)
      .expect(200)
    const issueId = report.body.issues[0].id

    const issue = await request(server)
      .patch(`/api/issues/${issueId}/status`)
      .send({ status: 'handled' })
      .expect(200)

    expect(issue.body.status).toBe('handled')

    const followUp = await request(server)
      .post(`/api/reports/${report.body.id}/follow-ups`)
      .send({ issueId, question: 'How should I start?' })
      .expect(201)

    expect(followUp.body).toMatchObject({
      reportId: report.body.id,
      issueId,
      answer: expect.any(String),
      nextActions: expect.any(Array),
    })

    const rating = await request(server)
      .post(`/api/reports/${report.body.id}/ratings`)
      .send({
        rating: 4,
        helpedUnderstandNextSteps: true,
        feedback: 'Useful structure',
      })
      .expect(201)

    expect(rating.body).toMatchObject({
      reportId: report.body.id,
      rating: 4,
      helpedUnderstandNextSteps: true,
      feedback: 'Useful structure',
    })

    await request(server)
      .post('/api/analytics-events')
      .send({
        name: 'upload_started',
        payload: {
          fileType: 'application/pdf',
          fileSizeBytes: 11,
          rawResumeContent: 'do not store this',
        },
      })
      .expect(201)

    const storedEvents = runtime.database
      .prepare('select payload_json from analytics_events')
      .all() as Array<{ payload_json: string }>

    expect(storedEvents).toHaveLength(1)
    expect(storedEvents[0].payload_json).not.toContain('do not store this')
  })

  test('fallback report copy avoids hiring-outcome claims', async () => {
    server = createApp({ database: runtime.database, uploadDir: runtime.uploadDir }).listen(0)
    const upload = await request(server)
      .post('/api/resumes')
      .attach('resume', Buffer.from('resume file'), {
        filename: 'resume.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      .expect(201)
    const created = await request(server)
      .post(`/api/resumes/${upload.body.resumeId}/analyses`)
      .expect(202)
    await createAnalysisWorker({ database: runtime.database }).processNext()
    const report = await request(server)
      .get(`/api/analyses/${created.body.analysisId}/report`)
      .expect(200)

    const copy = JSON.stringify(report.body).toLowerCase()

    for (const bannedTerm of ['interview', 'callback', 'offer', 'hiring', 'guarantee', 'recruiter']) {
      expect(copy).not.toContain(bannedTerm)
    }
  })
})
