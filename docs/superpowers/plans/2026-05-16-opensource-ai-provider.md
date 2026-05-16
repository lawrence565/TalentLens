# TalentLens Open-Source AI Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded fallback diagnosis with real AI (Claude BYOK), add PDF/DOCX text extraction, wire a provider factory to switch implementations via env vars, and document how contributors can add their own provider.

**Architecture:** A `resumeTextExtractor` utility reads the uploaded file and converts it to plain text; the Claude provider passes this text to the Anthropic API via a structured `tool_use` call to get a typed JSON report; a `providerFactory` reads `DIAGNOSIS_PROVIDER` and `ANTHROPIC_API_KEY` at startup and returns the correct provider instance to the analysis worker; `index.ts` is updated to call the factory instead of using the hardcoded fallback default.

**Tech Stack:** `pdf-parse` (PDF → text), `mammoth` (DOCX → text), `@anthropic-ai/sdk` (Claude API), existing Express + SQLite + TypeScript stack, Vitest for tests.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `server/src/providers/resumeTextExtractor.ts` | Read file by MIME type, return plain text string |
| Create | `server/src/providers/resumeTextExtractor.test.ts` | Tests for text extraction |
| Create | `server/src/providers/claudeDiagnosisProvider.ts` | Call Anthropic API, return `DiagnosisReportDraft` |
| Create | `server/src/providers/claudeDiagnosisProvider.test.ts` | Tests with mocked Anthropic SDK |
| Create | `server/src/providers/providerFactory.ts` | Read env vars, instantiate correct provider |
| Create | `server/src/providers/providerFactory.test.ts` | Tests for env var switching logic |
| Modify | `server/src/index.ts` | Use `createProvider()` instead of hardcoded fallback |
| Modify | `.env.example` | Add `ANTHROPIC_API_KEY`, document `DIAGNOSIS_PROVIDER` options |
| Create | `CONTRIBUTING.md` | How to add a custom diagnosis provider |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install pdf-parse mammoth @anthropic-ai/sdk
```

Expected: 3 packages added, no errors.

- [ ] **Step 2: Install type definitions**

```bash
npm install -D @types/pdf-parse @types/mammoth
```

Expected: 2 packages added, no errors.

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
npm run build
```

Expected: build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add pdf-parse, mammoth, @anthropic-ai/sdk dependencies"
```

---

## Task 2: Resume Text Extractor

**Files:**
- Create: `server/src/providers/resumeTextExtractor.ts`
- Create: `server/src/providers/resumeTextExtractor.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `server/src/providers/resumeTextExtractor.test.ts`:

```typescript
// @vitest-environment node
import { writeFile, mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { extractResumeText } from './resumeTextExtractor'

describe('extractResumeText', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'tl-extractor-'))
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  test('throws for unsupported MIME type text/plain', async () => {
    const filePath = join(tmpDir, 'resume.txt')
    await writeFile(filePath, 'not a real file')

    await expect(
      extractResumeText(filePath, 'text/plain')
    ).rejects.toThrow('Unsupported file type: text/plain')
  })

  test('throws for unsupported MIME type text/html', async () => {
    const filePath = join(tmpDir, 'resume.html')
    await writeFile(filePath, '<html/>')

    await expect(
      extractResumeText(filePath, 'text/html')
    ).rejects.toThrow('Unsupported file type: text/html')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- server/src/providers/resumeTextExtractor.test.ts
```

Expected: FAIL — `Cannot find module './resumeTextExtractor'`

- [ ] **Step 3: Implement the extractor**

Create `server/src/providers/resumeTextExtractor.ts`:

```typescript
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import mammoth from 'mammoth'

const require = createRequire(import.meta.url)

export async function extractResumeText(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>
    const buffer = await readFile(filePath)
    const result = await pdfParse(buffer)
    return result.text.trim()
  }

  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const buffer = await readFile(filePath)
    const result = await mammoth.extractRawText({ buffer })
    return result.value.trim()
  }

  throw new Error(`Unsupported file type: ${mimeType}`)
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run -- server/src/providers/resumeTextExtractor.test.ts
```

Expected: PASS — 2 tests passing.

- [ ] **Step 5: Commit**

```bash
git add server/src/providers/resumeTextExtractor.ts server/src/providers/resumeTextExtractor.test.ts
git commit -m "feat: add resume text extractor for PDF and DOCX"
```

---

## Task 3: Claude Diagnosis Provider

**Files:**
- Create: `server/src/providers/claudeDiagnosisProvider.ts`
- Create: `server/src/providers/claudeDiagnosisProvider.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `server/src/providers/claudeDiagnosisProvider.test.ts`:

```typescript
// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- server/src/providers/claudeDiagnosisProvider.test.ts
```

Expected: FAIL — `Cannot find module './claudeDiagnosisProvider'`

- [ ] **Step 3: Implement the Claude provider**

Create `server/src/providers/claudeDiagnosisProvider.ts`:

```typescript
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

export const createClaudeDiagnosisProvider = ({ apiKey }: { apiKey: string }): DiagnosisProvider => {
  const client = new Anthropic({ apiKey })

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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run -- server/src/providers/claudeDiagnosisProvider.test.ts
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add server/src/providers/claudeDiagnosisProvider.ts server/src/providers/claudeDiagnosisProvider.test.ts
git commit -m "feat: add Claude diagnosis provider with tool_use structured output"
```

---

## Task 4: Provider Factory

**Files:**
- Create: `server/src/providers/providerFactory.ts`
- Create: `server/src/providers/providerFactory.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `server/src/providers/providerFactory.test.ts`:

```typescript
// @vitest-environment node
import { describe, test, expect, vi } from 'vitest'

vi.mock('./claudeDiagnosisProvider', () => ({
  createClaudeDiagnosisProvider: vi.fn().mockReturnValue({ generateReport: vi.fn() }),
}))

vi.mock('./fallbackDiagnosisProvider', () => ({
  fallbackDiagnosisProvider: { generateReport: vi.fn() },
}))

import { createProvider } from './providerFactory'
import { createClaudeDiagnosisProvider } from './claudeDiagnosisProvider'

describe('createProvider', () => {
  test('returns fallback provider when DIAGNOSIS_PROVIDER is undefined', () => {
    const provider = createProvider({ diagnosisProvider: undefined, anthropicApiKey: undefined })
    expect(provider).toBeDefined()
    expect(createClaudeDiagnosisProvider).not.toHaveBeenCalled()
  })

  test('returns fallback provider when DIAGNOSIS_PROVIDER is "fallback"', () => {
    const provider = createProvider({ diagnosisProvider: 'fallback', anthropicApiKey: undefined })
    expect(provider).toBeDefined()
    expect(createClaudeDiagnosisProvider).not.toHaveBeenCalled()
  })

  test('returns Claude provider when DIAGNOSIS_PROVIDER is "claude"', () => {
    const provider = createProvider({ diagnosisProvider: 'claude', anthropicApiKey: 'sk-test' })
    expect(provider).toBeDefined()
    expect(createClaudeDiagnosisProvider).toHaveBeenCalledWith({ apiKey: 'sk-test' })
  })

  test('throws when DIAGNOSIS_PROVIDER is "claude" but ANTHROPIC_API_KEY is missing', () => {
    expect(() =>
      createProvider({ diagnosisProvider: 'claude', anthropicApiKey: undefined })
    ).toThrow('ANTHROPIC_API_KEY must be set when DIAGNOSIS_PROVIDER=claude')
  })

  test('throws for unknown DIAGNOSIS_PROVIDER values', () => {
    expect(() =>
      createProvider({ diagnosisProvider: 'gpt4', anthropicApiKey: undefined })
    ).toThrow('Unknown DIAGNOSIS_PROVIDER: gpt4')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- server/src/providers/providerFactory.test.ts
```

Expected: FAIL — `Cannot find module './providerFactory'`

- [ ] **Step 3: Implement the factory**

Create `server/src/providers/providerFactory.ts`:

```typescript
import type { DiagnosisProvider } from './diagnosisProvider'
import { fallbackDiagnosisProvider } from './fallbackDiagnosisProvider'
import { createClaudeDiagnosisProvider } from './claudeDiagnosisProvider'

interface ProviderConfig {
  diagnosisProvider: string | undefined
  anthropicApiKey: string | undefined
}

export const createProvider = ({ diagnosisProvider, anthropicApiKey }: ProviderConfig): DiagnosisProvider => {
  if (!diagnosisProvider || diagnosisProvider === 'fallback') {
    return fallbackDiagnosisProvider
  }

  if (diagnosisProvider === 'claude') {
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY must be set when DIAGNOSIS_PROVIDER=claude')
    }
    return createClaudeDiagnosisProvider({ apiKey: anthropicApiKey })
  }

  throw new Error(`Unknown DIAGNOSIS_PROVIDER: ${diagnosisProvider}`)
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run -- server/src/providers/providerFactory.test.ts
```

Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add server/src/providers/providerFactory.ts server/src/providers/providerFactory.test.ts
git commit -m "feat: add provider factory with env-based provider selection"
```

---

## Task 5: Wire index.ts to Use the Factory

**Files:**
- Modify: `server/src/index.ts`

- [ ] **Step 1: Update index.ts**

Replace the full contents of `server/src/index.ts`:

```typescript
import { mkdirSync } from 'node:fs'
import { createApp } from './app'
import { createAnalysisWorker } from './analyses/analysisWorker'
import { createDatabase } from './db/connection'
import { migrateDatabase } from './db/migrate'
import { createProvider } from './providers/providerFactory'

const databasePath = process.env.TALENTLENS_DATABASE_PATH ?? './data/talentlens.sqlite'
const uploadDir = process.env.TALENTLENS_UPLOAD_DIR ?? './uploads'
const port = Number(process.env.PORT ?? 5174)

mkdirSync(uploadDir, { recursive: true })
const database = createDatabase(databasePath)
migrateDatabase(database)

const provider = createProvider({
  diagnosisProvider: process.env.DIAGNOSIS_PROVIDER,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
})

const worker = createAnalysisWorker({ database, provider })

setInterval(() => {
  worker.processNext().catch(() => {
    // Keep server errors generic for this MVP.
  })
}, 500)

createApp({ database, uploadDir }).listen(port, () => {
  console.log(`TalentLens API listening on http://localhost:${port}`)
})
```

- [ ] **Step 2: Run the full test suite**

```bash
npm run test:run
```

Expected: all existing tests still pass, no regressions.

- [ ] **Step 3: Lint check**

```bash
npm run lint
```

Expected: no lint errors.

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: TypeScript compiles cleanly for both frontend and server.

- [ ] **Step 5: Commit**

```bash
git add server/src/index.ts
git commit -m "feat: wire provider factory to analysis worker in server entry point"
```

---

## Task 6: Update .env.example and Create CONTRIBUTING.md

**Files:**
- Modify: `.env.example`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Update .env.example**

Replace the full contents of `.env.example`:

```bash
# Frontend API base URL. Leave unset to use the mock client (no backend required).
VITE_TALENTLENS_API_BASE_URL=http://localhost:5174/api

# SQLite database file path (created automatically on first run).
TALENTLENS_DATABASE_PATH=./data/talentlens.sqlite

# Directory for uploaded resume files. Treat as sensitive local data; excluded from git.
TALENTLENS_UPLOAD_DIR=./uploads

# Diagnosis provider to use.
# Options:
#   fallback  — deterministic output, no API key required (default, good for local dev)
#   claude    — real AI diagnosis via Anthropic API, requires ANTHROPIC_API_KEY below
DIAGNOSIS_PROVIDER=fallback

# Required when DIAGNOSIS_PROVIDER=claude.
# Obtain your key at https://console.anthropic.com
ANTHROPIC_API_KEY=

# Express API port.
PORT=5174
```

- [ ] **Step 2: Create CONTRIBUTING.md**

Create `CONTRIBUTING.md` at the project root:

````markdown
# Contributing to TalentLens

## Local Development

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Open the app at `http://localhost:5173`. By default `DIAGNOSIS_PROVIDER=fallback` returns deterministic output without an API key.

To run with real AI locally, set in `.env`:

```
DIAGNOSIS_PROVIDER=claude
ANTHROPIC_API_KEY=your-key-here
```

## Running Checks

All three must pass before opening a pull request:

```bash
npm run test:run
npm run lint
npm run build
```

## Adding a Custom Diagnosis Provider

TalentLens uses a `DiagnosisProvider` interface to generate resume diagnosis reports. You can swap in any AI backend by implementing this interface.

### 1. Implement the Interface

The interface is defined in `server/src/providers/diagnosisProvider.ts`:

```typescript
export interface DiagnosisProvider {
  generateReport(input: {
    resume: ResumeRecord
    analysisId: string
  }): Promise<DiagnosisReportDraft>
}
```

`ResumeRecord` provides the file path and MIME type. Use `extractResumeText` from `server/src/providers/resumeTextExtractor.ts` to convert the file to plain text before sending it to your AI.

`DiagnosisReportDraft` must include:
- `overallScore`: number 0–100
- `summary`: string
- `issues`: `DiagnosisIssue[]` — set `status: 'open'` and `id: ''` on each (the worker generates real IDs)
- `atsChecks`: `ATSCheck[]` — set `id: ''` on each
- `followUpPrompts`: `string[]`

Create your provider file under `server/src/providers/`, for example `server/src/providers/openaiDiagnosisProvider.ts`.

### 2. Register It in the Factory

Edit `server/src/providers/providerFactory.ts` and add a branch:

```typescript
if (diagnosisProvider === 'openai') {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY must be set when DIAGNOSIS_PROVIDER=openai')
  return createOpenAIDiagnosisProvider({ apiKey })
}
```

### 3. Document the Env Var

Add the new provider name and any required keys to `.env.example` so other contributors know how to use it.

### 4. Write Tests

Create a test file alongside your provider (e.g. `server/src/providers/openaiDiagnosisProvider.test.ts`). Mock the external API call and verify that the returned `DiagnosisReportDraft` matches the expected shape. See `server/src/providers/claudeDiagnosisProvider.test.ts` for the pattern to follow.
````

- [ ] **Step 3: Run the full test suite one final time**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add .env.example CONTRIBUTING.md
git commit -m "docs: add CONTRIBUTING.md with provider guide and document env vars in .env.example"
```

---

## Self-Review Checklist

**Spec coverage:**
- PDF/DOCX text extraction → Task 2 ✓
- Claude AI provider with BYOK → Task 3 ✓
- Provider factory + `DIAGNOSIS_PROVIDER` env switching → Task 4 ✓
- `index.ts` wired to factory → Task 5 ✓
- `.env.example` with `ANTHROPIC_API_KEY` → Task 6 ✓
- `CONTRIBUTING.md` with provider guide → Task 6 ✓

**Type consistency:**
- `DiagnosisProvider` interface used in all three providers and the factory ✓
- `DiagnosisReportDraft` returned by `claudeDiagnosisProvider` matches the type from `diagnosisProvider.ts` ✓
- `createProvider` function name consistent across `providerFactory.ts` and `index.ts` ✓
- `extractResumeText(filePath, mimeType)` signature consistent across implementation and test mock ✓
- `id: ''` placeholder on issues/atsChecks matches how `analysisWorker.ts` ignores draft IDs when persisting ✓

**No placeholders:** All steps contain complete code and exact commands. ✓
