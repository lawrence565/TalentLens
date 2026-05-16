import Anthropic from '@anthropic-ai/sdk'
import type { DiagnosisProvider, DiagnosisReportDraft } from './diagnosisProvider'
import { extractResumeText } from './resumeTextExtractor'

const diagnosisTool: Anthropic.Tool = {
  name: 'submit_diagnosis',
  description: 'Submit the structured resume diagnosis report.',
  input_schema: {
    type: 'object' as const,
    properties: {
      overallScore: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
        description: 'Overall resume quality score from 0 to 100.',
      },
      summary: {
        type: 'string',
        description: 'Two to three sentence overall assessment of the resume.',
      },
      issues: {
        type: 'array',
        description: 'Top 3 to 5 resume issues ordered by priority (1 = most important).',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Short issue title (under 10 words).' },
            severity: { type: 'string', enum: ['high', 'medium', 'low'] },
            category: {
              type: 'string',
              enum: ['content_clarity', 'structure', 'keywords', 'missing_sections', 'formatting', 'ats_risk'],
            },
            reason: { type: 'string', description: 'Why this issue matters for recruiters or ATS.' },
            nextAction: { type: 'string', description: 'Concrete first step to fix this issue.' },
            priority: { type: 'integer', minimum: 1, description: 'Priority rank starting at 1.' },
          },
          required: ['title', 'severity', 'category', 'reason', 'nextAction', 'priority'],
        },
      },
      atsChecks: {
        type: 'array',
        description: 'ATS readability checks covering parsing, headings, readability, and file format.',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['parsing', 'headings', 'readability', 'file_format'] },
            label: { type: 'string', description: 'Short display label for this check.' },
            status: { type: 'string', enum: ['pass', 'warning', 'fail'] },
            reason: { type: 'string', description: 'What was found in this check.' },
            nextAction: { type: 'string', description: 'What the user should do about it.' },
          },
          required: ['type', 'label', 'status', 'reason', 'nextAction'],
        },
      },
      followUpPrompts: {
        type: 'array',
        description: 'Two to three suggested follow-up questions the user might ask.',
        items: { type: 'string' },
        maxItems: 3,
      },
    },
    required: ['overallScore', 'summary', 'issues', 'atsChecks', 'followUpPrompts'],
  },
}

interface RawIssue {
  title: string
  severity: 'high' | 'medium' | 'low'
  category: 'content_clarity' | 'structure' | 'keywords' | 'missing_sections' | 'formatting' | 'ats_risk'
  reason: string
  nextAction: string
  priority: number
}

interface RawATSCheck {
  type: 'parsing' | 'headings' | 'readability' | 'file_format'
  label: string
  status: 'pass' | 'warning' | 'fail'
  reason: string
  nextAction: string
}

interface DiagnosisToolInput {
  overallScore: number
  summary: string
  issues: RawIssue[]
  atsChecks: RawATSCheck[]
  followUpPrompts: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createAnthropicClient = (opts: { apiKey: string }): Anthropic => (Anthropic as any)(opts) ?? new Anthropic(opts)

export const createClaudeDiagnosisProvider = ({ apiKey }: { apiKey: string }): DiagnosisProvider => {
  const client = createAnthropicClient({ apiKey })

  return {
    async generateReport({ resume, analysisId: _ }) {
      const resumeText = await extractResumeText(resume.uploadPath, resume.mimeType)

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        tools: [diagnosisTool],
        tool_choice: { type: 'any' },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert resume reviewer helping individual job seekers improve their resumes. Analyze the resume below and submit a diagnosis using the provided tool. Be specific, direct, and actionable. Focus on the 3 to 5 most impactful improvements the user can make right now.\n\n<resume>\n${resumeText}\n</resume>`,
              },
            ],
          },
        ],
      })

      const toolBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )

      if (!toolBlock) {
        throw new Error('Claude did not return a diagnosis tool response')
      }

      const input = toolBlock.input as DiagnosisToolInput

      const draft: DiagnosisReportDraft = {
        overallScore: input.overallScore,
        summary: input.summary,
        issues: input.issues.map((issue, index) => ({
          id: '',
          title: issue.title,
          severity: issue.severity,
          category: issue.category,
          reason: issue.reason,
          nextAction: issue.nextAction,
          status: 'open',
          priority: issue.priority ?? index + 1,
        })),
        atsChecks: input.atsChecks.map((check) => ({
          id: '',
          type: check.type,
          label: check.label,
          status: check.status,
          reason: check.reason,
          nextAction: check.nextAction,
        })),
        followUpPrompts: input.followUpPrompts,
      }

      return draft
    },
  }
}
