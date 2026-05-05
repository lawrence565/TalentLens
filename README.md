# TalentLens

Vite + React frontend plus an Express + SQLite backend for the TalentLens MVP. The flow lets a user upload a resume, receive a diagnosis report, mark issues handled or dismissed, ask follow-up questions, and rate whether the report was helpful.

## Local Setup

Install dependencies from the lockfile:

```bash
npm install
```

Create local environment settings:

```bash
cp .env.example .env
```

Initialize the local SQLite schema:

```bash
npm run db:migrate
```

Start the frontend and backend together:

```bash
npm run dev
```

Use `npm run dev:web` for Vite only and `npm run dev:server` for the API only. The default API URL is `http://localhost:5174/api`.

## Runtime Configuration

- `VITE_TALENTLENS_API_BASE_URL`: frontend API base URL. Leave unset to use the mock client.
- `TALENTLENS_DATABASE_PATH`: local SQLite database path.
- `TALENTLENS_UPLOAD_DIR`: local upload directory. Treat this as sensitive local data.
- `DIAGNOSIS_PROVIDER`: provider selector. The current implementation uses deterministic `fallback`.
- `PORT`: Express API port.

Raw resume text is not written to SQLite. Uploaded files are stored locally in the configured upload directory and ignored by git.

## Docker Local Stack

Run the frontend and backend in separate containers on a shared Docker network:

```bash
docker compose up --build
```

Open the app at `http://localhost:5173`. The frontend container is configured with:

```text
VITE_TALENTLENS_API_BASE_URL=http://localhost:5174/api
```

The backend API is available at `http://localhost:5174/api`, and health can be checked with:

```bash
curl http://localhost:5174/api/health
```

The compose stack creates:

- `talentlens-frontend`: Vite dev server on host port `5173`.
- `talentlens-backend`: Express API on host port `5174`.
- `talentlens-local`: shared Docker network for the two services.
- `backend-data`: SQLite volume mounted at `/app/data`.
- `backend-uploads`: upload volume mounted at `/app/uploads`.

Stop and remove containers with:

```bash
docker compose down
```

Remove local backend volumes when you intentionally want to delete test data:

```bash
docker compose down -v
```

## Automated Verification

Run these checks before submitting changes:

```bash
npm run test:run
npm run lint
npm run build
```

For a quick smoke check, run:

```bash
npm run test:run -- src/test/smoke.test.tsx
```

## Local Release Verification Checklist

Use this checklist for the MVP diagnosis flow before release:

- Local install: run `npm install` successfully from a clean checkout.
- Test command: run `npm run test:run` and confirm it passes.
- Lint command: run `npm run lint` and confirm it passes.
- Build command: run `npm run build` and confirm the production build completes.
- API diagnosis flow: set `VITE_TALENTLENS_API_BASE_URL`, run `npm run dev`, upload a supported resume file, and confirm the diagnosis report appears with summary, prioritized issues, ATS checks, and next actions.
- Mock diagnosis flow: leave `VITE_TALENTLENS_API_BASE_URL` unset, run `npm run dev:web`, and confirm the mock diagnosis flow still works.
- File picker upload: use the upload button or file input to choose a PDF, DOC, or DOCX file and confirm progress, success, and error states are usable.
- Drag/drop upload: drag a supported file onto the upload area and confirm it follows the same validation and diagnosis flow as picker upload.
- Issue actions: mark report issues as handled and dismissed, then confirm the visible issue state updates without removing unrelated report content.
- Follow-up guidance: request follow-up guidance for an issue and confirm a relevant answer appears in the flow.
- Report helpfulness rating: submit the helpfulness rating and confirm the UI records the rating without blocking the report.
- Privacy checks: confirm raw resume content is not printed in the console, stored in `localStorage`, stored in `sessionStorage`, or displayed in upload or analysis error messages.
- No hiring-outcome claim checks: review UI copy, mock report copy, errors, and follow-up guidance to confirm TalentLens does not promise interviews, callbacks, offers, hiring decisions, or other hiring outcomes.

## Manual Browser Smoke

After starting `npm run dev`, verify the app in a desktop and mobile viewport:

- The page opens without console errors.
- The upload flow is usable from picker and drag/drop interactions.
- The diagnosis report appears after a mock analysis.
- Handled and dismissed issue actions work.
- Follow-up answers appear.
- Helpfulness rating can be submitted.
- Text and controls do not overlap on mobile.
