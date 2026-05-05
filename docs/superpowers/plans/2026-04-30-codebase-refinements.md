# Codebase Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate dead code from a prior iteration, fix six behavioral gaps surfaced by code review, and wire up the analytics event layer that is fully typed but never fired.

**Architecture:** Each task is an independent, self-contained change. Tasks 1–2 reduce noise first; Tasks 3–7 fix behavioral correctness; Tasks 8–9 add shared infrastructure (categoryLabels) and complete the analytics wiring.

**Tech Stack:** React 19, TypeScript 5, Vite, Tailwind CSS v4, Vitest + @testing-library/react

---

## File Map

| File | Action |
|---|---|
| `src/utils/constants.js` | Delete |
| `src/utils/helpers.js` | Delete |
| `src/services/api.ts` | Delete |
| `src/hooks/useSuggestions.ts` | Delete |
| `src/types/api.ts` | Delete |
| `src/types/index.ts` | Remove unused legacy types; add `categoryLabels` export (Task 9) |
| `src/components/layout/Header.tsx` | Make `onLogout` optional |
| `src/pages/HomePage.tsx` | Remove dead state/stubs; fix progress mapping; wire analytics |
| `src/pages/HomePage.test.tsx` | Add upload-progress assertion; add analytics tests |
| `src/hooks/useFileUpload.ts` | Add 10 MB file-size validation |
| `src/hooks/useFileUpload.test.tsx` | Add file-size validation test |
| `src/hooks/useDiagnosis.ts` | Fix `DEFAULT_SLOW_THRESHOLD_MS` constant (150 s → 180 s) |
| `src/hooks/useDiagnosis.test.tsx` | Remove source-inspection assertions; update threshold test |
| `src/components/features/SuggestionsSection.tsx` | Fix internal ID label; add `analytics` prop; pass `reportId` down |
| `src/components/features/SuggestionsSection.test.tsx` | Add `issueInteracted` analytics test |
| `src/components/ui/SuggestionItem.tsx` | Move props to local file; add `analytics`/`reportId`; fire event |
| `src/components/features/DiagnosisReportSection.tsx` | Replace local `categoryLabels` with shared import |
| `src/components/features/FollowUpPanel.tsx` | Add `analytics` prop; fire `followUpAsked` event |
| `src/components/features/FollowUpPanel.test.tsx` | Add `followUpAsked` analytics test |

---

## Task 1 — Remove dead legacy files and unused types

These five files are completely unused after the domain model moved to `TalentLensClient`. Deleting them removes the ambiguity about which API/data pattern is canonical.

**Files:**
- Delete: `src/utils/constants.js`
- Delete: `src/utils/helpers.js`
- Delete: `src/services/api.ts`
- Delete: `src/hooks/useSuggestions.ts`
- Delete: `src/types/api.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Delete the five unused files**

```bash
rm src/utils/constants.js \
   src/utils/helpers.js \
   src/services/api.ts \
   src/hooks/useSuggestions.ts \
   src/types/api.ts
```

- [ ] **Step 2: Remove unused legacy types from `src/types/index.ts`**

Open `src/types/index.ts` and delete the following blocks (keep everything else):

Remove the `Resume` interface (lines 11–21):
```ts
// DELETE this block:
export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  status: "uploading" | "processing" | "completed" | "error";
  suggestions?: Suggestion[];
}
```

Remove the `Suggestion` interface and its two union types (lines 23–47):
```ts
// DELETE these three blocks:
export interface Suggestion { ... }
export type SuggestionType = ...
export type SuggestionCategory = ...
```

Remove `ApiResponse` and `PaginatedResponse` (lines 58–72):
```ts
// DELETE these two blocks:
export interface ApiResponse<T = any> { ... }
export interface PaginatedResponse<T> extends ApiResponse<T[]> { ... }
```

Remove `LoginForm`, `RegisterForm`, `AuthContextType`, `ResumeContextType` (lines 93–122):
```ts
// DELETE these four blocks:
export interface LoginForm { ... }
export interface RegisterForm extends LoginForm { ... }
export interface AuthContextType { ... }
export interface ResumeContextType { ... }
```

The section comments between them (`// Form Types`, `// Context Types`) should also be removed.

After editing, `src/types/index.ts` should contain only: `User`, `FileUploadProgress`, `ButtonProps`, `IconProps`, `SuggestionItemProps`, and all the Diagnosis domain types (`IssueSeverity`, `IssueStatus`, `IssueCategory`, `ATSCheck`, `DiagnosisIssue`, `DiagnosisReport`, `UploadResumeResult`, `AnalysisStartResult`, `AnalysisProgress`, `FollowUpInput`, `FollowUpResponse`, `ReportRating`).

- [ ] **Step 3: Run the full test suite**

```bash
npm run test:run
```

Expected: `57 passed` — no failures. TypeScript compile errors would appear as test failures; if they do, check for any remaining imports of the removed types.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead legacy files and unused types from prior iteration"
```

---

## Task 2 — Clean up dead state and stub in `HomePage`

`currentUser` is always `null` (setter never called). `handleLogout` is `console.log`. Since auth is not yet implemented, remove the stub and make `Header`'s `onLogout` prop optional so the component no longer demands it.

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Make `onLogout` optional in `Header`**

In `src/components/layout/Header.tsx`, change the `HeaderProps` interface:

```tsx
// Before:
interface HeaderProps {
  user: User | null;
  onLogout: () => void | Promise<void>;
}

// After:
interface HeaderProps {
  user: User | null;
  onLogout?: () => void | Promise<void>;
}
```

The JSX body doesn't need to change — `onLogout` is only called inside the `user ? (...)` branch, and `user` is always `null` for now. When auth is implemented, the caller will provide it.

- [ ] **Step 2: Remove dead state and stub from `HomePage`**

In `src/pages/HomePage.tsx`, apply these three changes:

Remove the `currentUser` state import (`User` is no longer imported) and the `useState` for it. Pass `null` directly:

```tsx
// Remove this line (around line 36):
const [currentUser] = useState<User | null>(null)

// Remove the import of User from '../types' if it's no longer used after this task.
// (It is still used via the Header prop type indirectly — but HomePage itself
// only uses it in the useState which we're removing. Check after.)
```

Remove `handleLogout`:
```tsx
// Remove these lines (around lines 68–70):
const handleLogout = async (): Promise<void> => {
  console.log('Logout clicked')
}
```

Update the `Header` usage to not pass `user` or `onLogout` from state/stubs:
```tsx
// Before:
<Header user={currentUser} onLogout={handleLogout} />

// After:
<Header user={null} />
```

Also remove the `User` import from `'../types'` in `HomePage.tsx` since it's no longer referenced:
```tsx
// Before:
import type { FileUploadProgress, User } from '../types'

// After:
import type { FileUploadProgress } from '../types'
```

- [ ] **Step 3: Run the full test suite**

```bash
npm run test:run
```

Expected: `57 passed`.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/pages/HomePage.tsx
git commit -m "chore: remove unused currentUser state and handleLogout stub from HomePage"
```

---

## Task 3 — Remove fragile source-inspection assertions from `useDiagnosis` tests

Two tests read the hook's source file at runtime and assert on exact whitespace. This breaks on any formatting change and verifies implementation structure, not observable behavior. The actual behavior (no state update after unmount, no React console error) is already proven by the surrounding assertions.

**Files:**
- Modify: `src/hooks/useDiagnosis.test.tsx`

- [ ] **Step 1: Remove the `getHookSource` helper and its two call sites**

In `src/hooks/useDiagnosis.test.tsx`, delete:

Line 2 (the `readFileSync` import):
```ts
// DELETE:
import { readFileSync } from 'node:fs'
```

Line 113 (the helper function):
```ts
// DELETE:
const getHookSource = () => readFileSync(`${process.cwd()}/src/hooks/useDiagnosis.ts`, 'utf8')
```

Inside the test `'does not update issue state after unmount'` (around line 441), delete only the `getHookSource` assertion while keeping everything else:
```ts
// DELETE this line:
expect(getHookSource()).toContain('if (!mountedRef.current) {\n        return updatedIssue\n      }\n\n      setReport')
```

Inside the test `'does not store follow-up guidance after unmount'` (around line 506), delete only the `getHookSource` assertion while keeping everything else:
```ts
// DELETE this line:
expect(getHookSource()).toContain('if (mountedRef.current) {\n        setFollowUpResponse(response)\n      }')
```

- [ ] **Step 2: Run the full test suite**

```bash
npm run test:run
```

Expected: `57 passed`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useDiagnosis.test.tsx
git commit -m "test: remove source-file inspection assertions from useDiagnosis tests"
```

---

## Task 4 — Fix slow-analysis threshold constant (150 s → 180 s)

`DEFAULT_SLOW_THRESHOLD_MS = 150 * 1000` is 2.5 minutes, but two tests describe it as "before the 3-minute target." Fix the constant to 180 s (3 minutes) and update the test that advances fake timers to a time that would land inside the new boundary.

**Files:**
- Modify: `src/hooks/useDiagnosis.ts`
- Modify: `src/hooks/useDiagnosis.test.tsx`

- [ ] **Step 1: Write a failing test first**

In `src/hooks/useDiagnosis.test.tsx`, update the test titled `'uses a default slow-analysis threshold before the 3-minute target is exceeded'`. Change the timer advance from `179 * 1000` to `181 * 1000`:

```ts
// Before (around line 244):
await vi.advanceTimersByTimeAsync(179 * 1000)

// After:
await vi.advanceTimersByTimeAsync(181 * 1000)
```

- [ ] **Step 2: Run this test to confirm it now fails (179 s < 180 s threshold)**

```bash
npm run test:run -- --reporter=verbose 2>&1 | grep -A3 "slow-analysis threshold"
```

Expected: the test `'uses a default slow-analysis threshold before the 3-minute target is exceeded'` **fails** because `status` is still `'analyzing'` at 179 s with the current 150 s threshold (wait — at 179 s the status IS `slowAnalysis` with the current 150 s threshold, so the test still passes now; it will fail after we update the constant to 180 s in the next step). Run the full suite to confirm current 57 pass, then proceed to the next step where both change together.

- [ ] **Step 3: Fix the constant in `useDiagnosis.ts`**

In `src/hooks/useDiagnosis.ts`, change line 47:

```ts
// Before:
const DEFAULT_SLOW_THRESHOLD_MS = 150 * 1000

// After:
const DEFAULT_SLOW_THRESHOLD_MS = 180 * 1000
```

- [ ] **Step 4: Run the full test suite**

```bash
npm run test:run
```

Expected: `57 passed`. The test that advances 181 s now falls past the 180 s threshold and correctly sees `slowAnalysis`.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDiagnosis.ts src/hooks/useDiagnosis.test.tsx
git commit -m "fix: correct slow-analysis threshold to 3 minutes (180 s) as documented"
```

---

## Task 5 — Fix upload-progress display during analysis

`getUploadProgress` in `HomePage.tsx` passes the raw `progress` (analysis %) as the upload bar's width during `analyzing`/`slowAnalysis` states. Upload is already done at that point — the bar should show a completed state (`progress: 100`) while the separate diagnosis progress card tracks analysis. Add a test to lock this in.

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/HomePage.test.tsx`

- [ ] **Step 1: Write the failing test**

In `src/pages/HomePage.test.tsx`, inside `describe('HomePage diagnosis flow', ...)`, add this test after the existing `'submits a valid upload and renders upload, analysis, then report states'` test:

```tsx
it('shows a completed upload bar while analysis is running', () => {
  setDiagnosisState({
    status: 'analyzing',
    progress: 55,
  })

  const { container } = render(<HomePage />)

  const uploadProgressbar = container.querySelector(
    '[role="progressbar"][aria-label="Upload progress"]',
  )

  expect(uploadProgressbar).toBeInTheDocument()
  expect(uploadProgressbar).toHaveAttribute('aria-valuenow', '100')
})
```

- [ ] **Step 2: Run the new test to confirm it fails**

```bash
npm run test:run -- --reporter=verbose 2>&1 | grep -A5 "completed upload bar"
```

Expected: **FAIL** — `aria-valuenow` is `"55"` (the analysis progress), not `"100"`.

- [ ] **Step 3: Fix `getUploadProgress` in `HomePage.tsx`**

In `src/pages/HomePage.tsx`, update `getUploadProgress` (around line 15–29):

```tsx
// Before:
const getUploadProgress = (
  file: File | null,
  status: ReturnType<typeof useDiagnosis>['status'],
  progress: number,
): FileUploadProgress | null => {
  if (!file || status === 'idle' || status === 'error' || status === 'timeout') {
    return null
  }

  return {
    file,
    progress,
    status: status === 'uploading' ? 'uploading' : 'success',
  }
}

// After:
const getUploadProgress = (
  file: File | null,
  status: ReturnType<typeof useDiagnosis>['status'],
  progress: number,
): FileUploadProgress | null => {
  if (!file || status === 'idle' || status === 'error' || status === 'timeout') {
    return null
  }

  return {
    file,
    progress: status === 'uploading' ? progress : 100,
    status: status === 'uploading' ? 'uploading' : 'success',
  }
}
```

- [ ] **Step 4: Run the full test suite**

```bash
npm run test:run
```

Expected: `58 passed` (57 original + 1 new).

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/HomePage.test.tsx
git commit -m "fix: show upload complete (100%) during analysis instead of tracking analysis progress"
```

---

## Task 6 — Add file size validation to `useFileUpload`

The hook validates file type but silently accepts any file size. A user can submit a 1 GB file with no feedback. Add a 10 MB cap enforced before the client is called, consistent with the pattern used for type validation.

**Files:**
- Modify: `src/hooks/useFileUpload.ts`
- Modify: `src/hooks/useFileUpload.test.tsx`

- [ ] **Step 1: Write the failing test**

In `src/hooks/useFileUpload.test.tsx`, add this test inside `describe('useFileUpload', ...)` after the existing unsupported-type test:

```tsx
it('rejects files over 10 MB with a clear message before calling the client', async () => {
  const uploadResume = vi.fn()
  const { result } = renderHook(() => useFileUpload(makeClient(uploadResume)))

  const oversizeContent = 'x'.repeat(10 * 1024 * 1024 + 1)
  const oversizeFile = makeFile('resume.pdf', 'application/pdf', oversizeContent)
  let caughtError: unknown

  await act(async () => {
    try {
      await result.current.uploadFile(oversizeFile)
    } catch (error) {
      caughtError = error
    }
  })

  expect(caughtError).toEqual(new Error('File is too large. Maximum size is 10 MB.'))
  expect(uploadResume).not.toHaveBeenCalled()
  expect(result.current.error).toBe('File is too large. Maximum size is 10 MB.')
  expect(result.current.uploadProgress?.status).toBe('error')
})
```

- [ ] **Step 2: Run the new test to confirm it fails**

```bash
npm run test:run -- --reporter=verbose 2>&1 | grep -A5 "rejects files over 10 MB"
```

Expected: **FAIL** — `caughtError` is `undefined` because the oversize file is currently accepted.

- [ ] **Step 3: Implement file-size validation in `useFileUpload.ts`**

In `src/hooks/useFileUpload.ts`, add two constants after the existing `UNSUPPORTED_FILE_MESSAGE`:

```ts
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const FILE_TOO_LARGE_MESSAGE = 'File is too large. Maximum size is 10 MB.'
```

Add a helper below `isSupportedResumeFile`:

```ts
const isWithinSizeLimit = (file: File): boolean => file.size <= MAX_FILE_SIZE_BYTES
```

In the `uploadFile` callback, add the size check immediately after the type check:

```ts
// After the existing unsupported-type block:
if (!isWithinSizeLimit(file)) {
  setError(FILE_TOO_LARGE_MESSAGE)
  setUploadProgress({
    file,
    progress: 0,
    status: 'error',
    error: FILE_TOO_LARGE_MESSAGE,
  })
  throw new Error(FILE_TOO_LARGE_MESSAGE)
}
```

- [ ] **Step 4: Run the full test suite**

```bash
npm run test:run
```

Expected: `59 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFileUpload.ts src/hooks/useFileUpload.test.tsx
git commit -m "feat: reject resume files over 10 MB before upload"
```

---

## Task 7 — Fix `SuggestionsSection` internal ID label

The eyebrow text above "Issue actions" reads `Report report-resume-my-resume-pdf-14` — an internal storage ID. Replace it with the copy pattern used by every other section.

**Files:**
- Modify: `src/components/features/SuggestionsSection.tsx`

No new tests are needed — the existing `SuggestionsSection` tests already exercise this component's rendering. TypeScript compile + test-run confirm correctness.

- [ ] **Step 1: Replace the internal-ID eyebrow**

In `src/components/features/SuggestionsSection.tsx`, find the eyebrow paragraph (around line 20):

```tsx
// Before:
<p className="text-sm font-medium uppercase tracking-wide text-primary-600">
  Report {report.id}
</p>

// After:
<p className="text-sm font-medium uppercase tracking-wide text-primary-600">
  All issues
</p>
```

The `report` prop is still needed for `.summary` and `.issues`, so don't remove it.

- [ ] **Step 2: Run the full test suite**

```bash
npm run test:run
```

Expected: `59 passed` (count from Task 6 end).

- [ ] **Step 3: Commit**

```bash
git add src/components/features/SuggestionsSection.tsx
git commit -m "fix: replace internal report ID with readable section label in SuggestionsSection"
```

---

## Task 8 — Extract shared `categoryLabels` mapping

`categoryLabels: Record<IssueCategory, string>` is copy-pasted identically in `DiagnosisReportSection.tsx` and `SuggestionItem.tsx`. Move it to `src/types/index.ts` alongside the `IssueCategory` type it maps, and import it in both components.

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/components/features/DiagnosisReportSection.tsx`
- Modify: `src/components/ui/SuggestionItem.tsx`

- [ ] **Step 1: Add `categoryLabels` to `src/types/index.ts`**

Find the `IssueCategory` const+type definition (around line 130 after prior removals). Add the export immediately after:

```ts
export const IssueCategory = [
  'content_clarity',
  'structure',
  'keywords',
  'missing_sections',
  'formatting',
  'ats_risk',
] as const
export type IssueCategory = (typeof IssueCategory)[number]

// Add this right after:
export const categoryLabels: Record<IssueCategory, string> = {
  content_clarity: 'Content clarity',
  structure: 'Structure',
  keywords: 'Keywords',
  missing_sections: 'Missing sections',
  formatting: 'Formatting',
  ats_risk: 'ATS risk',
}
```

- [ ] **Step 2: Update `DiagnosisReportSection.tsx` to use the shared mapping**

In `src/components/features/DiagnosisReportSection.tsx`:

Remove the local `categoryLabels` const (lines 8–15):
```ts
// DELETE this block:
const categoryLabels: Record<IssueCategory, string> = {
  content_clarity: 'Content clarity',
  structure: 'Structure',
  keywords: 'Keywords',
  missing_sections: 'Missing sections',
  formatting: 'Formatting',
  ats_risk: 'ATS risk',
}
```

Update the import to pull `categoryLabels` from types:
```ts
// Before:
import type { DiagnosisIssue, DiagnosisReport, IssueCategory } from '../../types'

// After:
import { categoryLabels } from '../../types'
import type { DiagnosisIssue, DiagnosisReport } from '../../types'
```

- [ ] **Step 3: Update `SuggestionItem.tsx` to use the shared mapping**

In `src/components/ui/SuggestionItem.tsx`:

Remove the local `categoryLabels` const (lines 17–24):
```ts
// DELETE this block:
const categoryLabels: Record<IssueCategory, string> = {
  content_clarity: 'Content clarity',
  structure: 'Structure',
  keywords: 'Keywords',
  missing_sections: 'Missing sections',
  formatting: 'Formatting',
  ats_risk: 'ATS risk',
}
```

Update the import:
```ts
// Before:
import type { IssueCategory, IssueSeverity, IssueStatus, SuggestionItemProps } from '../../types'

// After:
import { categoryLabels } from '../../types'
import type { IssueSeverity, IssueStatus, SuggestionItemProps } from '../../types'
```

- [ ] **Step 4: Run the full test suite**

```bash
npm run test:run
```

Expected: `59 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts \
        src/components/features/DiagnosisReportSection.tsx \
        src/components/ui/SuggestionItem.tsx
git commit -m "refactor: extract shared categoryLabels to types/index.ts"
```

---

## Task 9 — Wire up remaining analytics events

Six analytics methods (`uploadStarted`, `uploadCompleted`, `reportViewed`, `timeToReportMeasured`, `issueInteracted`, `followUpAsked`) are fully typed and tested at the unit level but never called from the app. Wire them at three call sites: `HomePage`, `SuggestionItem`, and `FollowUpPanel`.

**Files:**
- Modify: `src/pages/HomePage.tsx` + `src/pages/HomePage.test.tsx`
- Modify: `src/components/features/SuggestionsSection.tsx` + `src/components/features/SuggestionsSection.test.tsx`
- Modify: `src/components/ui/SuggestionItem.tsx`
- Modify: `src/types/index.ts` (extend `SuggestionItemProps`)
- Modify: `src/components/features/FollowUpPanel.tsx` + `src/components/features/FollowUpPanel.test.tsx`

### Sub-task 9a — `uploadStarted`, `uploadCompleted`, `reportViewed`, `timeToReportMeasured` in `HomePage`

- [ ] **Step 1: Write the failing test**

In `src/pages/HomePage.test.tsx`, add this test at the end of `describe('HomePage diagnosis flow', ...)`:

```tsx
it('fires upload lifecycle analytics events when a report is returned', async () => {
  const track = vi.fn()
  const analytics = createAnalytics({ track })
  const user = userEvent.setup()

  submitResume.mockResolvedValue(report)

  render(<HomePage analytics={analytics} />)

  await user.upload(screen.getByLabelText(/choose resume file/i), makeFile())

  expect(track).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'upload_started',
      payload: expect.objectContaining({ fileType: 'application/pdf' }),
    }),
  )
  expect(track).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'upload_completed',
      payload: expect.objectContaining({
        resumeId: 'resume-1',
        analysisId: 'analysis-1',
      }),
    }),
  )
  expect(track).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'report_viewed',
      payload: expect.objectContaining({ reportId: 'report-1' }),
    }),
  )
  expect(track).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'time_to_report_measured',
      payload: expect.objectContaining({ reportId: 'report-1' }),
    }),
  )
})
```

- [ ] **Step 2: Run the new test to confirm it fails**

```bash
npm run test:run -- --reporter=verbose 2>&1 | grep -A5 "fires upload lifecycle"
```

Expected: **FAIL** — `track` is never called with these events.

- [ ] **Step 3: Update `handleFileUpload` in `HomePage.tsx`**

In `src/pages/HomePage.tsx`, replace `handleFileUpload`:

```tsx
// Before:
const handleFileUpload = async (file: File): Promise<void> => {
  setCurrentFile(file)

  try {
    await submitResume(file)
  } catch {
    // useDiagnosis owns the user-facing error copy.
  }
}

// After:
const handleFileUpload = async (file: File): Promise<void> => {
  setCurrentFile(file)
  const startTime = Date.now()

  analytics.uploadStarted({ fileType: file.type, fileSizeBytes: file.size })

  try {
    const diagnosisReport = await submitResume(file)

    if (diagnosisReport) {
      const durationMs = Date.now() - startTime
      analytics.uploadCompleted({
        resumeId: diagnosisReport.resumeId,
        analysisId: diagnosisReport.analysisId,
        durationMs,
      })
      analytics.reportViewed({ reportId: diagnosisReport.id, analysisId: diagnosisReport.analysisId })
      analytics.timeToReportMeasured({ reportId: diagnosisReport.id, durationMs })
    }
  } catch {
    // useDiagnosis owns the user-facing error copy.
  }
}
```

- [ ] **Step 4: Run the full test suite**

```bash
npm run test:run
```

Expected: `60 passed`.

### Sub-task 9b — `issueInteracted` in `SuggestionItem`

- [ ] **Step 5: Write the failing test for `issueInteracted`**

In `src/components/features/SuggestionsSection.test.tsx`, at the top add:

```tsx
import { createAnalytics } from '../../services/analytics'
```

Update the `SuggestionsHarness` component to accept and pass analytics:

```tsx
// Add analytics to HarnessProps:
interface HarnessProps {
  updateIssueStatus: (issueId: string, status: IssueStatus) => void | Promise<DiagnosisIssue>
  analytics?: ReturnType<typeof createAnalytics>
}

// Update SuggestionsHarness JSX to pass analytics down:
return (
  <SuggestionsSection
    report={report}
    updateIssueStatus={handleUpdateIssueStatus}
    analytics={analytics}
  />
)
```

Add this new test inside `describe('SuggestionsSection', ...)`:

```tsx
it('fires issueInteracted analytics when an issue is handled or dismissed', async () => {
  const track = vi.fn()
  const analytics = createAnalytics({ track })
  const user = userEvent.setup()
  const updateIssueStatus = vi.fn()

  render(<SuggestionsHarness updateIssueStatus={updateIssueStatus} analytics={analytics} />)

  const issue = screen.getByRole('article', { name: /lead with measurable impact/i })
  await user.click(within(issue).getByRole('button', { name: /mark handled/i }))

  expect(track).toHaveBeenCalledWith({
    name: 'issue_interacted',
    payload: {
      reportId: 'report-1',
      issueId: 'issue-impact',
      action: 'handled',
    },
  })

  const dismissIssue = screen.getByRole('article', { name: /simplify formatting for ats parsing/i })
  await user.click(within(dismissIssue).getByRole('button', { name: /dismiss issue/i }))

  expect(track).toHaveBeenCalledWith({
    name: 'issue_interacted',
    payload: {
      reportId: 'report-1',
      issueId: 'issue-formatting',
      action: 'dismissed',
    },
  })
})
```

- [ ] **Step 6: Run the new test to confirm it fails**

```bash
npm run test:run -- --reporter=verbose 2>&1 | grep -A5 "fires issueInteracted"
```

Expected: **FAIL**.

- [ ] **Step 7: Add `analytics` and `reportId` to `SuggestionItemProps` in `types/index.ts`**

`SuggestionItemProps` currently lives in `src/types/index.ts`. Since `Analytics` lives in `src/services/analytics.ts`, importing it into types would create a circular dependency direction. Instead, extend the props locally in `SuggestionItem.tsx` and export only what's needed:

In `src/types/index.ts`, update `SuggestionItemProps` to add `reportId`:

```ts
// Before:
export interface SuggestionItemProps {
  issue: DiagnosisIssue
  onUpdateStatus: (
    issueId: string,
    status: IssueStatus,
  ) => void | Promise<DiagnosisIssue>
}

// After:
export interface SuggestionItemProps {
  issue: DiagnosisIssue
  reportId: string
  onUpdateStatus: (
    issueId: string,
    status: IssueStatus,
  ) => void | Promise<DiagnosisIssue>
}
```

- [ ] **Step 8: Update `SuggestionItem.tsx` to accept analytics and fire `issueInteracted`**

In `src/components/ui/SuggestionItem.tsx`, update the imports:

```tsx
// Before:
import { categoryLabels } from '../../types'
import type { IssueSeverity, IssueStatus, SuggestionItemProps } from '../../types'

// After:
import { categoryLabels } from '../../types'
import type { IssueSeverity, IssueStatus, SuggestionItemProps } from '../../types'
import type { Analytics } from '../../services/analytics'
```

Extend the props interface locally:

```tsx
// Add below the imports, before the constants:
interface ExtendedSuggestionItemProps extends SuggestionItemProps {
  analytics?: Analytics
}
```

Update the component signature and `handleUpdateStatus`:

```tsx
// Before:
const SuggestionItem: React.FC<SuggestionItemProps> = ({
  issue,
  onUpdateStatus,
}) => {

// After:
const SuggestionItem: React.FC<ExtendedSuggestionItemProps> = ({
  issue,
  reportId,
  onUpdateStatus,
  analytics,
}) => {
```

In `handleUpdateStatus`, fire the event before the API call:

```tsx
const handleUpdateStatus = async (status: IssueStatus): Promise<void> => {
  setPending(true)
  setError(null)

  analytics?.issueInteracted({ reportId, issueId: issue.id, action: status })

  try {
    await onUpdateStatus(issue.id, status)
  } catch {
    setError('Could not update issue status. Please try again.')
  } finally {
    setPending(false)
  }
}
```

- [ ] **Step 9: Update `SuggestionsSection.tsx` to accept and pass `analytics` and `reportId`**

In `src/components/features/SuggestionsSection.tsx`, add analytics to the import and props:

```tsx
// Add to imports:
import type { Analytics } from '../../services/analytics'

// Before interface:
interface SuggestionsSectionProps {
  report: DiagnosisReport
  updateIssueStatus: (
    issueId: string,
    status: IssueStatus,
  ) => void | Promise<DiagnosisIssue>
}

// After:
interface SuggestionsSectionProps {
  report: DiagnosisReport
  updateIssueStatus: (
    issueId: string,
    status: IssueStatus,
  ) => void | Promise<DiagnosisIssue>
  analytics?: Analytics
}
```

Update the component to destructure and pass through:

```tsx
// Before:
const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  report,
  updateIssueStatus,
}) => (
  ...
    {report.issues.map((issue) => (
      <SuggestionItem
        key={issue.id}
        issue={issue}
        onUpdateStatus={updateIssueStatus}
      />
    ))}
  ...
)

// After:
const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  report,
  updateIssueStatus,
  analytics,
}) => (
  ...
    {report.issues.map((issue) => (
      <SuggestionItem
        key={issue.id}
        issue={issue}
        reportId={report.id}
        onUpdateStatus={updateIssueStatus}
        analytics={analytics}
      />
    ))}
  ...
)
```

- [ ] **Step 10: Pass `analytics` to `SuggestionsSection` in `HomePage.tsx`**

In `src/pages/HomePage.tsx`, update the `SuggestionsSection` usage:

```tsx
// Before:
<SuggestionsSection report={report} updateIssueStatus={updateIssueStatus} />

// After:
<SuggestionsSection report={report} updateIssueStatus={updateIssueStatus} analytics={analytics} />
```

- [ ] **Step 11: Run the full test suite**

```bash
npm run test:run
```

Expected: `61 passed`.

### Sub-task 9c — `followUpAsked` in `FollowUpPanel`

- [ ] **Step 12: Write the failing test**

In `src/components/features/FollowUpPanel.test.tsx`, add at the top:

```tsx
import { createAnalytics } from '../../services/analytics'
```

Add this test inside `describe('FollowUpPanel', ...)`:

```tsx
it('fires followUpAsked analytics when a question is submitted', async () => {
  const track = vi.fn()
  const analytics = createAnalytics({ track })
  const user = userEvent.setup()
  const askFollowUp = vi.fn(async (): Promise<FollowUpPanelResponse> => ({
    id: 'follow-up-1',
    reportId: 'report-1',
    issueId: 'issue-1',
    answer: 'Rewrite the bullet with a clear outcome.',
    nextActions: [],
    createdAt: '2026-04-30T10:01:00.000Z',
  }))

  render(
    <FollowUpPanel
      report={report}
      followUpResponse={null}
      askFollowUp={askFollowUp}
      analytics={analytics}
    />,
  )

  await user.selectOptions(screen.getByLabelText(/issue/i), 'issue-1')
  await user.type(screen.getByLabelText(/question/i), 'How do I start?')
  await user.click(screen.getByRole('button', { name: /ask follow-up/i }))

  await screen.findByText('Rewrite the bullet with a clear outcome.')

  expect(track).toHaveBeenCalledWith({
    name: 'follow_up_asked',
    payload: {
      reportId: 'report-1',
      issueId: 'issue-1',
      questionLength: 'How do I start?'.length,
    },
  })
})
```

- [ ] **Step 13: Run the new test to confirm it fails**

```bash
npm run test:run -- --reporter=verbose 2>&1 | grep -A5 "fires followUpAsked"
```

Expected: **FAIL**.

- [ ] **Step 14: Update `FollowUpPanel.tsx` to accept and call analytics**

In `src/components/features/FollowUpPanel.tsx`, add the import:

```tsx
// Add after existing imports:
import type { Analytics } from '../../services/analytics'
```

Extend the props interface:

```tsx
// Before:
interface FollowUpPanelProps {
  report: DiagnosisReport
  followUpResponse: FollowUpPanelResponse | null
  askFollowUp: (input: {
    issueId?: string
    question: string
  }) => Promise<FollowUpResponse>
}

// After:
interface FollowUpPanelProps {
  report: DiagnosisReport
  followUpResponse: FollowUpPanelResponse | null
  askFollowUp: (input: {
    issueId?: string
    question: string
  }) => Promise<FollowUpResponse>
  analytics?: Analytics
}
```

Destructure and call `followUpAsked` in `handleSubmit`:

```tsx
// Before:
const FollowUpPanel: React.FC<FollowUpPanelProps> = ({
  report,
  followUpResponse,
  askFollowUp,
}) => {

// After:
const FollowUpPanel: React.FC<FollowUpPanelProps> = ({
  report,
  followUpResponse,
  askFollowUp,
  analytics,
}) => {
```

In `handleSubmit`, fire the event before calling `askFollowUp`:

```tsx
const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
  event.preventDefault()

  if (!canSubmit) {
    return
  }

  setIsLoading(true)
  setError(null)

  analytics?.followUpAsked({
    reportId: report.id,
    issueId: selectedIssueId || undefined,
    questionLength: trimmedQuestion.length,
  })

  try {
    const nextResponse = await askFollowUp({
      issueId: selectedIssueId || undefined,
      question: trimmedQuestion,
    })
    setLocalResponse(nextResponse as FollowUpPanelResponse)
  } catch {
    setError(FAILURE_MESSAGE)
  } finally {
    setIsLoading(false)
  }
}
```

- [ ] **Step 15: Pass `analytics` to `FollowUpPanel` in `HomePage.tsx`**

In `src/pages/HomePage.tsx`, update the `FollowUpPanel` usage:

```tsx
// Before:
<FollowUpPanel
  report={report}
  followUpResponse={followUpResponse}
  askFollowUp={askFollowUp}
/>

// After:
<FollowUpPanel
  report={report}
  followUpResponse={followUpResponse}
  askFollowUp={askFollowUp}
  analytics={analytics}
/>
```

- [ ] **Step 16: Run the full test suite**

```bash
npm run test:run
```

Expected: `62 passed`.

- [ ] **Step 17: Commit**

```bash
git add src/pages/HomePage.tsx \
        src/pages/HomePage.test.tsx \
        src/components/features/SuggestionsSection.tsx \
        src/components/features/SuggestionsSection.test.tsx \
        src/components/ui/SuggestionItem.tsx \
        src/components/features/FollowUpPanel.tsx \
        src/components/features/FollowUpPanel.test.tsx \
        src/types/index.ts
git commit -m "feat: wire uploadStarted, uploadCompleted, reportViewed, timeToReportMeasured, issueInteracted, followUpAsked analytics events"
```

---

## Self-Review Checklist

**Spec coverage** (all 15 review findings):
- ✅ Dead files (constants.js, helpers.js, api.ts, useSuggestions.ts, types/api.ts) → Task 1
- ✅ Unused auth types (AuthContextType, ResumeContextType, etc.) → Task 1
- ✅ Dead `currentUser` state + `handleLogout` stub → Task 2
- ✅ `Header.onLogout` required but always stubbed → Task 2
- ✅ Fragile source-inspection tests → Task 3
- ✅ Slow-analysis threshold constant mismatch → Task 4
- ✅ Upload progress shows analysis % during analyzing state → Task 5
- ✅ No file size validation → Task 6
- ✅ `report.id` shown as user-facing label → Task 7
- ✅ `categoryLabels` duplicated → Task 8
- ✅ Analytics events defined but never fired → Task 9
- ✅ `types/api.ts` indirection → Task 1
- ➡️ `ATSCheck` const/interface name collision — intentionally deferred (valid TS, no behavioral issue, rename is a larger churn with no correctness benefit)
- ➡️ Mock always returns `completed` immediately — intentionally deferred (dev experience only, no production impact)
- ➡️ `FollowUpPanelResponse.rewriteExamples` — intentionally deferred (future API field, renders conditionally, no current behavior issue)

**Test count progression:** 57 → 58 (Task 5) → 59 (Task 6) → 59 (Tasks 7–8) → 62 (Task 9)
