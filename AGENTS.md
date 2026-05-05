# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React frontend. Application code lives in `src/`.
`src/main.tsx` is the browser entry point and `src/App.tsx` handles top-level composition.
Use `src/pages/` for views, `src/components/ui/` for primitives, `src/components/features/` for product sections, and `src/components/layout/` for shared layout.
Hooks live in `src/hooks/`, API access in `src/services/`, types in `src/types/`, utilities in `src/utils/`, and global styles in `src/style/`.
Use `public/` for static files and `src/assets/` for imported assets.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server with hot module reload.
- `npm run build`: create the production build in `dist/`.
- `npm run preview`: serve the built app locally.
- `npm run lint`: run ESLint over the repository.

There is currently no `npm test` script. Add one when introducing a test runner.

## Coding Style & Naming Conventions

Prefer TypeScript for new React code (`.tsx` for components, `.ts` for non-UI modules). Use functional components and hooks.
Name components in PascalCase, such as `UploadSection.tsx`; hooks in camelCase with a `use` prefix, such as `useFileUpload.ts`; and utility exports in camelCase.
Follow the existing style: ES modules, single quotes, no semicolons, and 2-space indentation.
Run `npm run lint` before submitting changes. The current ESLint config targets JS/JSX files, so keep TypeScript clean with the compiler until lint coverage is expanded.

## Testing Guidelines

No test framework is configured yet. For new tests, prefer colocated files using `*.test.ts` or `*.test.tsx` near the code they cover, or a mirrored `src/__tests__/` structure if broader integration tests are added.
Prioritize coverage for hooks, API response handling, file upload behavior, and user-facing page flows.
Until tests are added, verify with `npm run lint`, `npm run build`, and a local browser pass via `npm run dev`.

## Commit & Pull Request Guidelines

This repository has no existing commit history on `main`, so use concise imperative commit messages such as `Add upload error handling`.
Pull requests should include a short summary, screenshots or screen recordings for UI changes, manual verification steps, and any linked issue or task reference.
Call out configuration changes, environment variables, or dependency updates explicitly.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep API endpoints and configuration centralized in `src/services/` or constants modules, and document any required runtime variables in `README.md` when they are introduced.
