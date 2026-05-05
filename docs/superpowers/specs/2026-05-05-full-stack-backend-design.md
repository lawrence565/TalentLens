# TalentLens Full-Stack Backend Design

## Purpose

TalentLens is a resume diagnosis MVP for individual job seekers. The full-stack backend must support the existing frontend diagnosis flow without changing the product into a resume editor, job tracker, job-description matcher, or hiring-outcome predictor.

The backend will replace the current frontend-only mock flow with a real API, SQLite persistence, an asynchronous analysis job boundary, and a diagnosis provider adapter. The first provider will be deterministic fallback logic so the app is useful and testable without an AI key. A future AI provider can be added behind the same interface.

## Confirmed Direction

- Backend runtime: Express + TypeScript.
- Persistence: SQLite.
- Analysis execution: in-process analysis queue and worker.
- Diagnosis provider: adapter interface with deterministic fallback as the default.
- Frontend integration: implement the existing `TalentLensClient` contract over HTTP.
- Scope discipline: keep the MVP focused on upload, diagnosis, issue actions, follow-up guidance, ratings, and metrics.

## Architecture

The frontend remains a Vite + React application. The existing `TalentLensClient` interface stays as the boundary between UI behavior and transport. A new API-backed client will implement that interface, while the current mock client remains available for tests and local fallback.

The backend will live under `server/` and expose `/api` REST endpoints. Route handlers should validate input and delegate to focused services or repositories. They should not contain database schema details, worker orchestration internals, or diagnosis generation logic.

SQLite stores product state: uploaded resume metadata, analysis status, generated report data, issue status, follow-up guidance, ratings, and analytics events. Raw resume text must not be written into the database. Uploaded files may be temporarily stored on disk under a local upload directory that is ignored by git and documented as sensitive local data.

The analysis worker is intentionally in-process for the first full-stack version. Creating an analysis writes a queued row and enqueues the analysis id. The worker marks the analysis processing, calls the configured provider, persists the report and related records, then marks the analysis completed. If generation fails, the worker marks the analysis failed with a safe generic error.

## API Contract

The API should align with the existing frontend domain types in `src/types/index.ts`.

### Resume Upload

`POST /api/resumes`

Accepts multipart form data containing one resume file. Supported formats are PDF, DOC, and DOCX. The endpoint validates type and size, saves local file metadata, and returns:

- `resumeId`
- `fileName`
- `fileSize`
- `fileType`
- `uploadedAt`

### Analysis Creation

`POST /api/resumes/:resumeId/analyses`

Creates an analysis job for an uploaded resume and returns:

- `analysisId`
- `resumeId`
- `status: "queued"`

### Analysis Progress

`GET /api/analyses/:analysisId/progress`

Returns:

- `analysisId`
- `status: "queued" | "processing" | "completed" | "failed"`
- `progress`
- `estimatedSecondsRemaining`
- `reportId` when completed
- `error` when failed

### Diagnosis Report

`GET /api/analyses/:analysisId/report`

Returns a `DiagnosisReport` after the analysis completes. If the report is not ready, the API should return `409`.

### Issue Status

`PATCH /api/issues/:issueId/status`

Accepts `status: "open" | "handled" | "dismissed"` and returns the updated `DiagnosisIssue`.

### Follow-Up Guidance

`POST /api/reports/:reportId/follow-ups`

Accepts:

- `question`
- optional `issueId`

Returns `FollowUpResponse` and persists the interaction.

### Report Rating

`POST /api/reports/:reportId/ratings`

Accepts:

- `rating`
- `helpedUnderstandNextSteps`
- optional `feedback`

Persists the rating and returns the stored record.

### Analytics Events

`POST /api/analytics-events`

Accepts the typed frontend analytics event payload and stores it. Analytics must not include raw resume content.

## Data Model

SQLite tables:

- `resumes`: id, file name, mime type, size, upload path, created at.
- `analyses`: id, resume id, status, progress, error, started at, completed at.
- `reports`: id, resume id, analysis id, overall score, summary, created at.
- `issues`: id, report id, title, severity, category, additional categories JSON, reason, next action, status, priority.
- `ats_checks`: id, report id, type, label, status, reason, next action.
- `follow_ups`: id, report id, issue id, question, answer, next actions JSON, created at.
- `report_ratings`: id, report id, rating, helped understand next steps, feedback, created at.
- `analytics_events`: id, name, payload JSON, created at.

Repositories should own SQL details and return typed records. Tests should be able to initialize a temporary SQLite database without touching the developer's local data.

## Backend Module Boundaries

Planned backend structure:

```text
server/
  src/
    app.ts
    index.ts
    db/
      connection.ts
      migrate.ts
      repositories/
    resumes/
      resumeRoutes.ts
      resumeService.ts
    analyses/
      analysisRoutes.ts
      analysisQueue.ts
      analysisWorker.ts
      analysisService.ts
    reports/
      reportRoutes.ts
      reportService.ts
    followUps/
      followUpRoutes.ts
      followUpService.ts
    analytics/
      analyticsRoutes.ts
    providers/
      diagnosisProvider.ts
      fallbackDiagnosisProvider.ts
    shared/
      errors.ts
      ids.ts
      validation.ts
```

The worker and provider are separate from HTTP routes so future AI work does not require rewriting route handlers or frontend code.

## Diagnosis Provider

The provider interface:

```ts
interface DiagnosisProvider {
  generateReport(input: {
    resume: ResumeRecord
    analysisId: string
  }): Promise<DiagnosisReportDraft>
}
```

The default provider is `fallbackDiagnosisProvider`. It should produce a useful MVP report with:

- An overall score.
- A short summary.
- Three to five prioritized issues.
- Severity, category, reason, next action, status, and priority for each issue.
- ATS checks for parsing, headings, readability, and file format.
- Follow-up prompt suggestions.

The fallback copy must avoid promises or implications of interviews, callbacks, offers, hiring, guarantees, or recruiting outcomes.

Future provider selection can use `DIAGNOSIS_PROVIDER`. If no provider is configured, fallback remains the default.

## Frontend Integration

Add `src/services/apiTalentLensClient.ts` to implement `TalentLensClient` with `fetch`.

Add `src/services/talentLensClientFactory.ts` so the app can choose:

- API client when `VITE_TALENTLENS_API_BASE_URL` is set.
- Mock client when no API base URL is configured.

Update `useDiagnosis` to use the factory for its default client while keeping dependency injection for tests.

Report ratings and analytics should be able to post to the backend without breaking the current no-op behavior in tests.

## Error Handling

Use consistent safe errors:

- `400`: invalid file format, invalid size, invalid enum values, invalid payload.
- `404`: resume, analysis, report, issue, or follow-up target not found.
- `409`: report requested before analysis completion.
- `500`: unexpected server failure.

Error messages must not include raw resume content. Internal logs should stay generic in this first version.

## Privacy And Security Rules

- Do not commit `.env`, SQLite database files, or uploads.
- Do not write raw resume text into SQLite.
- Do not include raw resume content in errors, analytics payloads, test snapshots, or console output.
- Keep API endpoints and runtime configuration documented in `README.md`.
- Treat local upload files as sensitive developer data.

## Testing Strategy

Implementation should follow TDD.

Backend tests:

- Upload accepts PDF, DOC, and DOCX.
- Upload rejects unsupported types and oversized files with safe errors.
- Analysis lifecycle moves from queued to processing to completed or failed.
- Completed analysis produces a diagnosis report matching the frontend contract.
- Report copy avoids hiring-outcome claims.
- Issue status updates persist.
- Follow-up guidance persists and returns expected response shape.
- Ratings and analytics events persist without raw resume content.

Frontend tests:

- API client sends the expected requests and parses responses.
- `useDiagnosis` still works with injected clients.
- Existing mock flow tests continue passing.

Verification commands:

- `npm run test:run`
- `npm run lint`
- `npm run build`

## Development Commands

Planned scripts:

- `npm run dev:web`: run Vite only.
- `npm run dev:server`: run Express API only.
- `npm run dev`: run frontend and backend together.
- `npm run db:migrate`: initialize SQLite schema.
- `npm run start:server`: run the compiled server.
- `npm run test:run`: run frontend and backend tests.
- `npm run build`: build the frontend and typecheck/build the backend.

## Documentation Updates

Update:

- `README.md`: full-stack setup, environment variables, dev commands, verification checklist.
- `.env.example`: API base URL, database path, upload directory, provider selection.
- `.gitignore`: local DB files, uploads, and environment files.

## Explicitly Out Of Scope

- Full resume editor.
- Automatic final resume generation.
- Job application tracking.
- Job-description matching.
- User accounts and authentication.
- Multi-user consultant, school, or HR workflows.
- Production-grade distributed queue.
- Direct AI provider implementation in the first backend skeleton.
