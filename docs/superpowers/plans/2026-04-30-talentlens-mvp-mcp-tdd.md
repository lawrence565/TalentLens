# TalentLens MCP-First MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the TalentLens MVP from `docs/PRD.md`: upload a resume, analyze it through an MCP-first service contract, show a prioritized diagnosis report, let users handle/dismiss issues, and support follow-up guidance.

**Architecture:** The frontend should depend on a typed TalentLens client abstraction, with MCP tools/resources as the primary integration contract and mock adapters for local development. UI state should be feature-scoped: upload, analysis/report, suggestion actions, and follow-up guidance remain independently testable.

**Tech Stack:** Vite, React 19, TypeScript, Vitest, React Testing Library, MCP client adapter, existing CSS/Tailwind-style utility classes, ESLint.

---

## Guiding Principles

- MCP first: define tool/resource contracts before wiring UI flows to transport details.
- TDD first: every behavior change starts with a failing test, then minimal implementation, then refactor.
- Sub-agent first: implementation proceeds task-by-task through fresh workers, followed by spec-compliance review and code-quality review.
- Sensitive data: resume files and extracted text should never be logged, persisted in local storage, or exposed in error messages.
- MVP boundary: diagnosis only. Do not build a resume editor, final resume generator, job tracker, or JD matching workflow in the MVP.

## Proposed MCP Surface

The frontend should be coded against this contract. The actual MCP server can be implemented in the backend or provided by a local bridge, but the frontend should not care.

### Tools

- `talentlens.upload_resume`
  - Input: `{ fileName, fileType, fileSize, fileContentRef }`
  - Output: `{ resumeId, status }`
  - Notes: frontend may upload binary through a bridge endpoint, then pass a content reference to MCP.
- `talentlens.analyze_resume`
  - Input: `{ resumeId }`
  - Output: `{ analysisId, status, estimatedSecondsRemaining }`
- `talentlens.get_diagnosis_report`
  - Input: `{ analysisId }`
  - Output: `{ overallScore, summary, issues, atsChecks, generatedAt }`
- `talentlens.update_issue_status`
  - Input: `{ issueId, status }`
  - Output: `{ issueId, status, updatedAt }`
- `talentlens.ask_follow_up`
  - Input: `{ analysisId, issueId?, question }`
  - Output: `{ answer, examples? }`

### Resources

- `talentlens://resume/{resumeId}/metadata`
- `talentlens://analysis/{analysisId}/report`
- `talentlens://analysis/{analysisId}/issues`

## Target File Structure

- Create: `src/services/talentlensClient.ts`
  - Owns the frontend-facing service interface and adapter selection.
- Create: `src/services/mcpTalentlensClient.ts`
  - Implements the TalentLens client with MCP tool/resource calls.
- Create: `src/services/mockTalentlensClient.ts`
  - Provides deterministic local development behavior and test fixtures.
- Create: `src/services/talentlensClient.test.ts`
  - Verifies adapter behavior, validation, and error mapping.
- Modify: `src/types/index.ts`
  - Add diagnosis report, issue, ATS check, upload status, and follow-up types.
- Modify: `src/types/api.ts`
  - Keep compatibility exports or migrate API-specific types behind the new client contract.
- Modify: `src/hooks/useFileUpload.ts`
  - Replace simulated upload with typed client flow and validation.
- Create: `src/hooks/useDiagnosis.ts`
  - Owns upload-to-analysis state, polling, report loading, and error states.
- Create: `src/hooks/useDiagnosis.test.tsx`
  - Covers the main report lifecycle and edge cases.
- Modify: `src/pages/HomePage.tsx`
  - Compose upload, report, suggestion actions, and follow-up state.
- Create: `src/components/features/DiagnosisReportSection.tsx`
  - Shows summary, top issues, ATS checks, status, and progress.
- Create: `src/components/features/FollowUpPanel.tsx`
  - Lets users ask for more detail about an issue.
- Modify: `src/components/features/UploadSection.tsx`
  - Add invalid file feedback, drag/drop states, and upload progress.
- Modify: `src/components/features/SuggestionsSection.tsx`
  - Align suggestions with diagnosis issue model and handled/dismissed statuses.
- Modify: `package.json`
  - Add test scripts and test dependencies.
- Create: `vitest.config.ts`
  - Configure Vitest and jsdom.
- Create: `src/test/setup.ts`
  - Configure React Testing Library cleanup and DOM matchers.

## Phase 0: Project Test Foundation

Purpose: make TDD possible before product work begins.

### Task 0.1: Install and Configure Test Runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Write the failing verification**

Add a minimal test file first:

```tsx
// src/test/smoke.test.tsx
import { describe, expect, it } from 'vitest'

describe('test harness', () => {
  it('runs Vitest', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/test/smoke.test.tsx`

Expected: FAIL because `npm test` and/or Vitest are not configured.

- [ ] **Step 3: Add minimal test setup**

Install dev dependencies:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/test/smoke.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/test/smoke.test.tsx
git commit -m "Add frontend test harness"
```

## Phase 1: MCP Contract and Local Adapter

Purpose: lock the integration boundary before UI implementation.

### Task 1.1: Define Diagnosis Domain Types

**Files:**
- Modify: `src/types/index.ts`
- Test: `src/types/diagnosis.test.ts`

- [ ] **Step 1: Write failing type/fixture tests**

Test that a diagnosis issue fixture supports severity, category, reason, next action, and status.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/types/diagnosis.test.ts`

Expected: FAIL because the new diagnosis model does not exist.

- [ ] **Step 3: Add minimal types**

Add `DiagnosisReport`, `DiagnosisIssue`, `IssueSeverity`, `IssueStatus`, `ATSCheck`, `FollowUpResponse`, and `AnalysisStatus`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/types/diagnosis.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/types/diagnosis.test.ts
git commit -m "Add diagnosis domain types"
```

### Task 1.2: Build TalentLens Client Interface and Mock Adapter

**Files:**
- Create: `src/services/talentlensClient.ts`
- Create: `src/services/mockTalentlensClient.ts`
- Test: `src/services/talentlensClient.test.ts`

- [ ] **Step 1: Write failing tests**

Cover upload validation, analysis start, deterministic report retrieval, issue status update, and follow-up response.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/services/talentlensClient.test.ts`

Expected: FAIL because the client files do not exist.

- [ ] **Step 3: Implement minimal interface and mock adapter**

Expose:

```ts
export interface TalentLensClient {
  uploadResume(file: File): Promise<UploadResumeResult>
  startAnalysis(resumeId: string): Promise<AnalysisStartResult>
  getDiagnosisReport(analysisId: string): Promise<DiagnosisReport>
  updateIssueStatus(issueId: string, status: IssueStatus): Promise<DiagnosisIssue>
  askFollowUp(input: FollowUpInput): Promise<FollowUpResponse>
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/services/talentlensClient.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/talentlensClient.ts src/services/mockTalentlensClient.ts src/services/talentlensClient.test.ts
git commit -m "Add TalentLens client contract"
```

### Task 1.3: Add MCP Adapter Skeleton

**Files:**
- Create: `src/services/mcpTalentlensClient.ts`
- Test: `src/services/mcpTalentlensClient.test.ts`

- [ ] **Step 1: Write failing tests**

Assert that frontend client methods call the expected MCP tools: `talentlens.upload_resume`, `talentlens.analyze_resume`, `talentlens.get_diagnosis_report`, `talentlens.update_issue_status`, and `talentlens.ask_follow_up`.

Also assert MCP resource behavior:

- `getDiagnosisReport(analysisId)` constructs `talentlens://analysis/{analysisId}/report`.
- issue loading constructs `talentlens://analysis/{analysisId}/issues` when a report references separately loaded issues.
- adapter uses `readResource` when available for report/issues reads.
- adapter falls back to `talentlens.get_diagnosis_report` only when the transport does not expose `readResource`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/services/mcpTalentlensClient.test.ts`

Expected: FAIL because the MCP adapter does not exist.

- [ ] **Step 3: Implement minimal adapter**

Inject a small MCP transport interface so tests can pass without a real MCP server:

```ts
export interface McpTransport {
  callTool<TInput, TOutput>(name: string, input: TInput): Promise<TOutput>
  readResource?<TOutput>(uri: string): Promise<TOutput>
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/services/mcpTalentlensClient.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/mcpTalentlensClient.ts src/services/mcpTalentlensClient.test.ts
git commit -m "Add MCP TalentLens adapter"
```

## Phase 2: Upload and Analysis Lifecycle

Purpose: satisfy the PRD upload-to-report flow with clear status and errors.

### Task 2.1: Replace Simulated Upload with Client-Backed Upload

**Files:**
- Modify: `src/hooks/useFileUpload.ts`
- Modify: `src/components/features/UploadSection.tsx`
- Test: `src/hooks/useFileUpload.test.tsx`
- Test: `src/components/features/UploadSection.test.tsx`

- [ ] **Step 1: Write failing tests**

Cover valid PDF/DOC/DOCX acceptance, invalid file rejection, upload pending/uploading/success/error states, and no sensitive file content in errors.

For `UploadSection`, also cover:

- selecting a file through the file input,
- drag-and-drop file selection,
- visible progress label/bar updates,
- invalid file type message,
- failed upload message with retry affordance.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/hooks/useFileUpload.test.tsx src/components/features/UploadSection.test.tsx`

Expected: FAIL because current hook simulates upload and lacks validation.

- [ ] **Step 3: Implement minimal hook changes**

Inject or import the TalentLens client and return the uploaded `resumeId`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/hooks/useFileUpload.test.tsx src/components/features/UploadSection.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFileUpload.ts src/hooks/useFileUpload.test.tsx src/components/features/UploadSection.tsx src/components/features/UploadSection.test.tsx
git commit -m "Connect resume upload to TalentLens client"
```

### Task 2.2: Add Diagnosis Lifecycle Hook

**Files:**
- Create: `src/hooks/useDiagnosis.ts`
- Test: `src/hooks/useDiagnosis.test.tsx`

- [ ] **Step 1: Write failing tests**

Cover `idle -> uploading -> analyzing -> reportReady`, analysis failure, report failure, and retry/reset behavior.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/hooks/useDiagnosis.test.tsx`

Expected: FAIL because `useDiagnosis` does not exist.

- [ ] **Step 3: Implement minimal hook**

Coordinate upload, `startAnalysis`, report retrieval, issue status update, and follow-up submission.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/hooks/useDiagnosis.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDiagnosis.ts src/hooks/useDiagnosis.test.tsx
git commit -m "Add diagnosis lifecycle hook"
```

## Phase 3: Diagnosis Report UI

Purpose: turn the PRD report requirements into a focused first-screen product experience.

### Task 3.1: Implement Report Section

**Files:**
- Create: `src/components/features/DiagnosisReportSection.tsx`
- Test: `src/components/features/DiagnosisReportSection.test.tsx`

- [ ] **Step 1: Write failing tests**

Assert rendering of overall assessment, short summary, top prioritized issues, severity labels, categories, reasons, next actions, and ATS checks.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/components/features/DiagnosisReportSection.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement minimal component**

Render dense, readable report content without resume editing controls.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/components/features/DiagnosisReportSection.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/DiagnosisReportSection.tsx src/components/features/DiagnosisReportSection.test.tsx
git commit -m "Add diagnosis report section"
```

### Task 3.2: Wire Home Page to Diagnosis Flow

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/components/features/UploadSection.tsx`
- Test: `src/pages/HomePage.test.tsx`

- [ ] **Step 1: Write failing integration tests**

Simulate upload and verify that the page moves from upload to analysis status to diagnosis report.

Also verify user-facing upload details remain visible at the page level:

- drag/drop upload path starts the same diagnosis flow as file picker upload,
- progress is visible while upload/analysis is active,
- invalid file and failed upload messages are clear and actionable.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/pages/HomePage.test.tsx`

Expected: FAIL because HomePage still uses mock resume ID and suggestions flow.

- [ ] **Step 3: Implement minimal page wiring**

Use `useDiagnosis` as the page-level workflow coordinator.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/pages/HomePage.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx src/components/features/UploadSection.tsx src/pages/HomePage.test.tsx
git commit -m "Wire homepage diagnosis flow"
```

## Phase 4: Issue Actions and Follow-Up Guidance

Purpose: support the PRD's handled/dismissed actions and request-based guidance.

### Task 4.1: Update Issue Actions

**Files:**
- Modify: `src/components/features/SuggestionsSection.tsx`
- Modify: `src/components/ui/SuggestionItem.tsx`
- Test: `src/components/features/SuggestionsSection.test.tsx`

- [ ] **Step 1: Write failing tests**

Assert users can mark an issue handled or dismissed, and the UI reflects status without removing report context.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/components/features/SuggestionsSection.test.tsx`

Expected: FAIL because current suggestions model lacks handled/dismissed issue status.

- [ ] **Step 3: Implement minimal action wiring**

Map issue actions to `updateIssueStatus`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/components/features/SuggestionsSection.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/SuggestionsSection.tsx src/components/ui/SuggestionItem.tsx src/components/features/SuggestionsSection.test.tsx
git commit -m "Add diagnosis issue actions"
```

### Task 4.2: Add Follow-Up Panel

**Files:**
- Create: `src/components/features/FollowUpPanel.tsx`
- Test: `src/components/features/FollowUpPanel.test.tsx`

- [ ] **Step 1: Write failing tests**

Assert users can ask a question about a specific issue and see a direct answer with optional rewrite examples.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/components/features/FollowUpPanel.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement minimal panel**

Keep follow-up guidance secondary to the diagnosis report.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/components/features/FollowUpPanel.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/FollowUpPanel.tsx src/components/features/FollowUpPanel.test.tsx
git commit -m "Add diagnosis follow-up panel"
```

## Phase 5: Metrics, Privacy, and Production Readiness

Purpose: prepare the MVP for trustworthy operation without widening scope.

### Task 5.1: Add Frontend Metrics Events

**Files:**
- Create: `src/services/analytics.ts`
- Test: `src/services/analytics.test.ts`

- [ ] **Step 1: Write failing tests**

Cover events for upload started, upload completed, report viewed, issue interacted, follow-up asked, and time-to-report measured.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/services/analytics.test.ts`

Expected: FAIL because analytics service does not exist.

- [ ] **Step 3: Implement minimal no-op analytics adapter**

Expose a typed API that can later send events to a real provider.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/services/analytics.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/analytics.ts src/services/analytics.test.ts
git commit -m "Add frontend MVP metrics events"
```

### Task 5.2: End-to-End Manual Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document verification checklist**

Include local setup, MCP adapter mode, mock adapter mode, upload validation, report view, issue actions, and follow-up flow.

- [ ] **Step 2: Run checks**

Run:

```bash
npm run lint
npm run test:run
npm run build
npm run dev
```

Expected: lint, tests, and build pass; browser pass confirms the core flow is usable.

- [ ] **Step 3: Verify sensitive-data handling**

Manual browser checks:

- upload a sample resume through file picker and drag/drop,
- confirm resume file contents and extracted text are not written to `localStorage`,
- confirm resume file contents and extracted text are not written to `sessionStorage`,
- confirm console logs do not include resume text or binary content,
- confirm failed upload/analyze errors do not include resume text or binary content.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "Document MVP verification workflow"
```

## Sub-Agent Execution Model

For each task:

1. Controller extracts exactly one task from this plan.
2. Controller dispatches a fresh implementer sub-agent with:
   - the task text,
   - relevant PRD section,
   - exact files it may touch,
   - TDD requirement: no production code before a failing test,
   - sensitive-data rules.
3. Implementer reports one of `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`.
4. Controller dispatches a spec reviewer sub-agent.
5. If spec review finds gaps, the same implementer fixes them and the reviewer re-checks.
6. Controller dispatches a code quality reviewer sub-agent.
7. If code quality review finds issues, the same implementer fixes them and the reviewer re-checks.
8. Controller marks the task complete only after both reviewers approve.

Do not dispatch multiple implementation sub-agents against overlapping files. Parallel work is acceptable only for read-only review or clearly disjoint write sets.

## Phase Order and Release Gates

- Gate 0: `npm run test:run` works.
- Gate 1: Client contract and MCP adapter tests pass.
- Gate 2: Upload and analysis lifecycle tests pass.
- Gate 3: Report UI and HomePage integration tests pass.
- Gate 4: Issue actions and follow-up tests pass.
- Gate 5: `npm run lint`, `npm run test:run`, `npm run build`, browser smoke, and sensitive-data checks pass.

## Open Assumptions

- A backend or bridge will expose actual MCP tool calls; until then the frontend uses `mockTalentlensClient`.
- Binary file handling may require an upload endpoint before MCP receives a `fileContentRef`.
- No authentication is required for the first MVP unless backend policy requires it.
- Existing REST service code can remain temporarily, but new MVP work should go through `TalentLensClient`.
