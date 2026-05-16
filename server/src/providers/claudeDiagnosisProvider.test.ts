// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: mockCreate } }
  }),
}))

vi.mock('./resumeTextExtractor', () => ({
  extractResumeText: vi.fn().mockResolvedValue('John Doe\nSoftware Engineer\n5 years experience'),
}))

import { createClaudeDiagnosisProvider } from './claudeDiagnosisProvider'

const mockResumeRecord = {
  id: 'resume-1',
  fileName: 'resume.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  uploadPath: '/tmp/resume.pdf',
  createdAt: '2026-05-16T00:00:00.000Z',
}

const mockToolInput = {
  overallScore: 78,
  summary: 'Strong foundation with a few key areas to improve.',
  issues: [
    {
      title: 'Add measurable impact',
      severity: 'high',
      category: 'content_clarity',
      reason: 'Bullets describe duties without results.',
      nextAction: 'Rewrite top 3 bullets with metrics.',
      priority: 1,
    },
  ],
  atsChecks: [
    {
      type: 'parsing',
      label: 'Parsing risk',
      status: 'pass',
      reason: 'Single-column layout is ATS-friendly.',
      nextAction: 'Keep this layout.',
    },
  ],
  followUpPrompts: ['How should I rewrite my first experience bullet?'],
}

describe('claudeDiagnosisProvider', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'tool_use', name: 'submit_diagnosis', input: mockToolInput }],
    })
  })

  test('returns a DiagnosisReportDraft from Claude tool_use response', async () => {
    const provider = createClaudeDiagnosisProvider({ apiKey: 'test-key' })
    const result = await provider.generateReport({
      resume: mockResumeRecord,
      analysisId: 'analysis-1',
    })

    expect(result.overallScore).toBe(78)
    expect(result.summary).toBe('Strong foundation with a few key areas to improve.')
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].title).toBe('Add measurable impact')
    expect(result.issues[0].severity).toBe('high')
    expect(result.atsChecks).toHaveLength(1)
    expect(result.atsChecks[0].status).toBe('pass')
    expect(result.followUpPrompts).toHaveLength(1)
  })

  test('sets status=open and id="" on all issues', async () => {
    const provider = createClaudeDiagnosisProvider({ apiKey: 'test-key' })
    const result = await provider.generateReport({
      resume: mockResumeRecord,
      analysisId: 'analysis-1',
    })

    expect(result.issues[0].status).toBe('open')
    expect(result.issues[0].id).toBe('')
    expect(result.atsChecks[0].id).toBe('')
  })

  test('throws when Claude returns no tool_use block', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'Sorry, I cannot help.' }] })

    const provider = createClaudeDiagnosisProvider({ apiKey: 'test-key' })

    await expect(
      provider.generateReport({ resume: mockResumeRecord, analysisId: 'analysis-1' })
    ).rejects.toThrow('Claude did not return a diagnosis tool response')
  })
})
