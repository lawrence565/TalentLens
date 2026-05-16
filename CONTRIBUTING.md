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
