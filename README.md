# TalentLens Frontend

Vite + React frontend for the TalentLens MVP. The local MVP flow lets a user upload a resume, receive a mock diagnosis report, mark issues handled or dismissed, ask follow-up questions, and rate whether the report was helpful.

## Local Setup

Install dependencies from the lockfile:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
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
- Mock diagnosis flow: run `npm run dev`, upload a supported resume file, and confirm the mock diagnosis report appears with summary, prioritized issues, ATS checks, and next actions.
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
