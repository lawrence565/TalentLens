# TalentLens MVP Sub-Agent TDD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the TalentLens MVP from `docs/PRD.md`: users upload a resume, receive a prioritized diagnosis report within the product flow, mark issues handled/dismissed, and ask request-based follow-up questions.

**Architecture:** Keep the frontend focused on diagnosis, not editing. Introduce a typed `TalentLensClient` boundary so UI and hooks can be tested against deterministic mock data first, then wired to the real backend transport later without rewriting the product flow.

**Tech Stack:** Vite, React 19, TypeScript, Vitest, React Testing Library, existing CSS/Tailwind setup, ESLint.

---

## Product Phases

### Phase A: MVP Diagnosis Flow

This is the first implementation target.

- Resume upload for PDF, DOC, and DOCX.
- Upload validation, progress, and clear error states.
- AI diagnosis report model and UI.
- Overall assessment, short summary, top 3-5 prioritized issues, severity, category, reason, and next action.
- Formatting and ATS readability checks.
- Issue actions: handled and dismissed.
- Follow-up guidance for specific issues.
- Lightweight report-helpfulness rating and metrics hooks for PRD success metrics.
- Privacy guardrails: do not log, store, or display raw resume content in errors.
- Copy guardrails: never promise interviews, callbacks, offers, or hiring outcomes.

### Phase B: MVP Hardening

Ship-readiness after the core flow works.

- Empty, loading, retry, and failure state polish.
- Manual browser QA across desktop and mobile.
- README verification checklist.
- Time-to-report instrumentation.
- Sensitive-data manual checks for console, `localStorage`, and `sessionStorage`.

### Phase C: Post-MVP Direction

Do not implement in the MVP tasks below.

- Job-description matching and gap analysis.
- Resume version comparison.
- Exportable improvement checklist.
- Saved diagnosis history.
- Deeper rewrite assistance.
- Resume editor or final resume generator.

## Sub-Agent Operating Model

Use one fresh implementer sub-agent per task. Do not run multiple implementer sub-agents in parallel if their write sets overlap.

For every task:

1. Controller gives the implementer only the task text, relevant PRD sections, allowed files, and TDD rules.
2. Implementer writes a failing test first and reports the exact failing command/output.
3. Implementer writes minimal production code, reruns the targeted test, then reruns the relevant broader test command.
4. Implementer self-reviews and reports `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`.
5. Controller dispatches a spec reviewer sub-agent.
6. The same implementer fixes any spec gaps until the reviewer approves.
7. Controller dispatches a code quality reviewer sub-agent.
8. The same implementer fixes quality issues until the reviewer approves.
9. Controller marks the task complete and proceeds to the next task.

Reviewer prompts should check:

- PRD compliance.
- MVP scope discipline.
- TDD evidence.
- Sensitive-data handling.
- No hiring-outcome claims in UI copy, mock data, or errors.
- Accessibility and mobile basics for UI tasks.
- No unrelated refactors.

Reviewer output must use this gate:

```text
VERDICT: APPROVED | BLOCKED
FINDINGS:
- [P0/P1/P2] File/path and concrete issue
REQUIRED_FIXES:
- Exact changes required before approval
```

Implementer output must include:

- RED command and expected failure excerpt.
- GREEN command and passing excerpt.
- Files changed.
- Focused diff summary.
- Any concerns or blockers.

## Target File Structure

- Modify: `package.json`
  - Add test scripts and dev dependencies.
- Create: `vitest.config.ts`
  - Configure Vitest with jsdom.
- Create: `src/test/setup.ts`
  - Configure React Testing Library matchers and cleanup.
- Modify: `src/types/index.ts`
  - Add diagnosis, issue, ATS check, upload, analysis, and follow-up types.
- Create: `src/services/talentLensClient.ts`
  - Define the frontend-facing client interface.
- Create: `src/services/mockTalentLensClient.ts`
  - Provide deterministic MVP report data for tests and local development.
- Modify: `src/hooks/useFileUpload.ts`
  - Validate files and call the client-backed upload flow.
- Create: `src/hooks/useDiagnosis.ts`
  - Coordinate upload, analysis, report loading, issue status, and follow-up state.
- Modify: `src/components/features/UploadSection.tsx`
  - Support picker, drag/drop, progress, and actionable errors.
- Create: `src/components/features/DiagnosisReportSection.tsx`
  - Render the MVP diagnosis report.
- Modify: `src/components/features/SuggestionsSection.tsx`
  - Render diagnosis issues and handled/dismissed actions.
- Modify: `src/components/ui/SuggestionItem.tsx`
  - Align item UI to the diagnosis issue model.
- Create: `src/components/features/FollowUpPanel.tsx`
  - Support request-based guidance.
- Modify: `src/pages/HomePage.tsx`
  - Compose the full MVP flow.
- Create: `src/services/analytics.ts`
  - Provide typed no-op metrics events.
- Create: `src/components/features/ReportRating.tsx`
  - Let users rate whether the report helped them understand what to fix.
- Modify: `README.md`
  - Document local verification.

## Phase 0: TDD Foundation

Purpose: make test-first development possible before changing product behavior.

### Task 0.1: Add Vitest and React Testing Library

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest'

describe('test harness', () => {
  it('runs Vitest', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/test/smoke.test.tsx`

Expected: FAIL because `npm test` and Vitest are not configured.

- [ ] **Step 3: Implement minimal setup**

Install:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/test/smoke.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/test/smoke.test.tsx
git commit -m "Add frontend test harness"
```

## Phase 1: Domain Contract

Purpose: define the diagnosis product contract before UI wiring.

### Task 1.1: Add Diagnosis Domain Types

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/types/diagnosis.test.ts`

- [ ] **Step 1: Write the failing test**

Test a report fixture that includes:

- `overallScore`
- `summary`
- 3-5 prioritized issues
- issue `severity`, `category`, `reason`, `nextAction`, and `status`
- issue categories covering content clarity, structure, keywords, missing sections, formatting, and ATS risks
- ATS checks for parsing risk, headings, readability, and file format
- no mock report copy promises interviews, callbacks, offers, or hiring outcomes

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/types/diagnosis.test.ts`

Expected: FAIL because the diagnosis model does not exist.

- [ ] **Step 3: Implement minimal types**

Add `DiagnosisReport`, `DiagnosisIssue`, `IssueSeverity`, `IssueStatus`, `IssueCategory`, `ATSCheck`, `UploadResumeResult`, `AnalysisStartResult`, `AnalysisProgress`, `FollowUpInput`, `FollowUpResponse`, and `ReportRating`.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/types/diagnosis.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/types/diagnosis.test.ts
git commit -m "Add diagnosis domain model"
```

### Task 1.2: Add TalentLens Client and Mock Adapter

**Files:**
- Create: `src/services/talentLensClient.ts`
- Create: `src/services/mockTalentLensClient.ts`
- Create: `src/services/talentLensClient.test.ts`

- [ ] **Step 1: Write failing tests**

Cover:

- accepts PDF/DOC/DOCX uploads
- rejects invalid file types
- returns a deterministic `resumeId`
- starts analysis from a `resumeId`
- returns analysis progress with estimated seconds remaining
- returns a diagnosis report
- updates issue status to handled/dismissed
- returns follow-up guidance
- never includes raw file content in error messages

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/services/talentLensClient.test.ts`

Expected: FAIL because the client files do not exist.

- [ ] **Step 3: Implement minimal client interface**

```ts
export interface TalentLensClient {
  uploadResume(file: File): Promise<UploadResumeResult>
  startAnalysis(resumeId: string): Promise<AnalysisStartResult>
  getAnalysisProgress(analysisId: string): Promise<AnalysisProgress>
  getDiagnosisReport(analysisId: string): Promise<DiagnosisReport>
  updateIssueStatus(issueId: string, status: IssueStatus): Promise<DiagnosisIssue>
  askFollowUp(input: FollowUpInput): Promise<FollowUpResponse>
}
```

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/services/talentLensClient.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/talentLensClient.ts src/services/mockTalentLensClient.ts src/services/talentLensClient.test.ts
git commit -m "Add TalentLens client contract"
```

## Phase 2: Upload and Analysis Lifecycle

Purpose: satisfy the PRD core flow from file selection to report readiness.

### Task 2.1: Make Upload File Validation Testable

**Files:**
- Modify: `src/hooks/useFileUpload.ts`
- Modify: `src/components/features/UploadSection.tsx`
- Create: `src/hooks/useFileUpload.test.tsx`
- Create: `src/components/features/UploadSection.test.tsx`

- [ ] **Step 1: Write failing tests**

Cover:

- PDF, DOC, and DOCX are accepted.
- Other file types are rejected with clear messages.
- File picker starts upload.
- Drag/drop starts upload.
- Upload progress is visible.
- Failed upload can be retried.

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/hooks/useFileUpload.test.tsx src/components/features/UploadSection.test.tsx`

Expected: FAIL because upload is still simulated and validation is incomplete.

- [ ] **Step 3: Implement minimal upload behavior**

Use `TalentLensClient.uploadResume(file)` and return the resulting `resumeId`.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/hooks/useFileUpload.test.tsx src/components/features/UploadSection.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFileUpload.ts src/hooks/useFileUpload.test.tsx src/components/features/UploadSection.tsx src/components/features/UploadSection.test.tsx
git commit -m "Connect resume upload flow"
```

### Task 2.2: Add Diagnosis Lifecycle Hook

**Files:**
- Create: `src/hooks/useDiagnosis.ts`
- Create: `src/hooks/useDiagnosis.test.tsx`

- [ ] **Step 1: Write failing tests**

Cover:

- `idle -> uploading -> analyzing -> reportReady`
- progress polling while analysis is running
- slow-analysis user-facing status before the 3-minute target is exceeded
- timeout state if analysis exceeds the configured maximum wait
- upload failure
- analysis failure
- report loading failure
- reset
- issue status update
- follow-up request

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/hooks/useDiagnosis.test.tsx`

Expected: FAIL because `useDiagnosis` does not exist.

- [ ] **Step 3: Implement minimal lifecycle hook**

Coordinate `uploadResume`, `startAnalysis`, `getAnalysisProgress`, `getDiagnosisReport`, `updateIssueStatus`, and `askFollowUp`.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/hooks/useDiagnosis.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDiagnosis.ts src/hooks/useDiagnosis.test.tsx
git commit -m "Add diagnosis lifecycle hook"
```

## Phase 3: MVP Report Experience

Purpose: make the diagnosis useful, prioritized, and easy to act on.

### Task 3.1: Add Diagnosis Report Section

**Files:**
- Create: `src/components/features/DiagnosisReportSection.tsx`
- Create: `src/components/features/DiagnosisReportSection.test.tsx`

- [ ] **Step 1: Write failing tests**

Assert rendering of:

- overall assessment
- short summary
- top prioritized issues
- severity labels
- categories
- reasons
- next actions
- ATS checks
- direct copy that explains risks without claiming the user will get interviews, callbacks, offers, or hiring outcomes

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/components/features/DiagnosisReportSection.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement minimal report UI**

Render report content only. Do not add editing or automatic resume generation.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/components/features/DiagnosisReportSection.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/DiagnosisReportSection.tsx src/components/features/DiagnosisReportSection.test.tsx
git commit -m "Add diagnosis report UI"
```

### Task 3.2: Wire Home Page to the Diagnosis Flow

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Create: `src/pages/HomePage.test.tsx`

- [ ] **Step 1: Write failing integration tests**

Simulate a valid upload and verify:

- upload state appears
- analysis state appears
- slow-analysis status appears when analysis takes longer than expected
- timeout state appears when analysis exceeds the configured maximum wait
- report appears
- upload errors are visible and actionable
- report does not appear before analysis completes

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/pages/HomePage.test.tsx`

Expected: FAIL because `HomePage` still uses a mock resume ID and suggestion-only flow.

- [ ] **Step 3: Implement minimal page composition**

Use `useDiagnosis` as the page-level workflow coordinator.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/pages/HomePage.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/HomePage.test.tsx
git commit -m "Wire homepage diagnosis flow"
```

## Phase 4: Issue Actions and Follow-Up

Purpose: complete the PRD interaction requirements.

### Task 4.1: Add Handled and Dismissed Issue Actions

**Files:**
- Modify: `src/components/features/SuggestionsSection.tsx`
- Modify: `src/components/ui/SuggestionItem.tsx`
- Create: `src/components/features/SuggestionsSection.test.tsx`

- [ ] **Step 1: Write failing tests**

Assert:

- handled action updates issue status
- dismissed action updates issue status
- status is visible after action
- original report context remains available

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/components/features/SuggestionsSection.test.tsx`

Expected: FAIL because current suggestions are not the diagnosis issue model.

- [ ] **Step 3: Implement minimal action wiring**

Map UI actions to `useDiagnosis.updateIssueStatus`.

- [ ] **Step 4: Verify GREEN**

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
- Create: `src/components/features/FollowUpPanel.test.tsx`

- [ ] **Step 1: Write failing tests**

Assert:

- user can ask a question about a specific issue
- submit button is disabled for empty input
- loading state appears
- answer appears
- rewrite examples appear only when provided
- failed follow-up shows a clear retryable error

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/components/features/FollowUpPanel.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement minimal panel**

Keep the panel secondary to the diagnosis report.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/components/features/FollowUpPanel.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/FollowUpPanel.tsx src/components/features/FollowUpPanel.test.tsx
git commit -m "Add diagnosis follow-up panel"
```

## Phase 5: Metrics, Privacy, and Release Gate

Purpose: make the MVP measurable and trustworthy.

### Task 5.1: Add Typed MVP Metrics Events

**Files:**
- Create: `src/services/analytics.ts`
- Create: `src/services/analytics.test.ts`

- [ ] **Step 1: Write failing tests**

Cover events for:

- upload started
- upload completed
- report viewed
- issue interacted
- follow-up asked
- time-to-report measured
- report helpfulness rating submitted

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/services/analytics.test.ts`

Expected: FAIL because analytics service does not exist.

- [ ] **Step 3: Implement minimal no-op analytics adapter**

Expose a typed API that records no data by default and can be replaced later.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/services/analytics.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/analytics.ts src/services/analytics.test.ts
git commit -m "Add MVP analytics events"
```

### Task 5.2: Add Report Helpfulness Rating

**Files:**
- Create: `src/components/features/ReportRating.tsx`
- Create: `src/components/features/ReportRating.test.tsx`
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Write failing tests**

Assert:

- rating is shown only after a diagnosis report is visible
- user can answer whether the report helped them understand what to fix
- submitting rating sends the typed analytics event
- rating UI does not require account creation
- rating copy does not promise hiring outcomes

- [ ] **Step 2: Verify RED**

Run: `npm run test:run -- src/components/features/ReportRating.test.tsx src/pages/HomePage.test.tsx`

Expected: FAIL because rating UI does not exist.

- [ ] **Step 3: Implement minimal rating UI**

Use a compact positive/neutral/negative control or equivalent single-question rating. Keep it secondary to the report.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:run -- src/components/features/ReportRating.test.tsx src/pages/HomePage.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/ReportRating.tsx src/components/features/ReportRating.test.tsx src/pages/HomePage.tsx
git commit -m "Add report helpfulness rating"
```

### Task 5.3: Document and Run Release Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write the verification checklist**

Document:

- local install
- test command
- lint command
- build command
- mock diagnosis flow
- file picker upload
- drag/drop upload
- issue actions
- follow-up guidance
- report helpfulness rating
- privacy checks
- no hiring-outcome claim checks

- [ ] **Step 2: Run automated checks**

Run:

```bash
npm run lint
npm run test:run
npm run build
```

Expected: all pass.

- [ ] **Step 3: Run local browser smoke**

Run: `npm run dev`

Verify:

- page opens without console errors
- upload flow is usable
- report appears
- handled/dismissed actions work
- follow-up answer appears
- helpfulness rating can be submitted
- mobile layout does not overlap text or controls

- [ ] **Step 4: Verify sensitive-data handling**

Manual checks:

- raw resume content is not logged to console
- raw resume content is not stored in `localStorage`
- raw resume content is not stored in `sessionStorage`
- error messages do not include raw resume text or binary content
- UI copy does not promise interviews, callbacks, job offers, or hiring outcomes

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "Document MVP verification workflow"
```

## Release Gates

- Gate 0: `npm run test:run` exists and passes smoke tests.
- Gate 1: diagnosis types and client contract tests pass.
- Gate 2: upload and diagnosis lifecycle tests pass.
- Gate 3: report UI and page integration tests pass.
- Gate 4: issue actions and follow-up tests pass.
- Gate 5: metrics/rating tests, lint, full test run, build, browser smoke, privacy checks, and no-outcome-claim checks pass.

## Sub-Agent Task Assignment Order

Use this order for MVP implementation:

1. Worker A: Task 0.1, test harness.
2. Worker B: Task 1.1, domain types.
3. Worker C: Task 1.2, client contract and mock adapter.
4. Worker D: Task 2.1, upload validation and UI.
5. Worker E: Task 2.2, diagnosis lifecycle hook.
6. Worker F: Task 3.1, diagnosis report UI.
7. Worker G: Task 3.2, homepage integration.
8. Worker H: Task 4.1, issue actions.
9. Worker I: Task 4.2, follow-up panel.
10. Worker J: Task 5.1, metrics.
11. Worker K: Task 5.2, report helpfulness rating.
12. Worker L: Task 5.3, release verification.

Workers should not reuse session history from previous tasks. The controller must provide the task text, relevant PRD sections, current approved interfaces, and current file shapes needed for the task.

## Open Assumptions

- The first MVP can use `mockTalentLensClient` until the real backend contract is ready.
- Backend transport is intentionally out of scope for this plan; the frontend should depend only on `TalentLensClient`.
- Authentication is not required for MVP unless the backend later requires it.
- Existing generated/demo code may remain unless it blocks the PRD flow.
- There is currently no test runner, so Phase 0 is mandatory before any product task.
