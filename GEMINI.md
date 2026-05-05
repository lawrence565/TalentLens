# TalentLens Frontend

A Vite + React (TypeScript) frontend for the TalentLens MVP. This application provides a platform for users to upload resumes and receive automated diagnosis reports with actionable suggestions for improvement, specifically focused on ATS (Applicant Tracking System) optimization and content clarity.

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

## 🧪 Testing and Verification

### Run All Tests
```bash
npm run test:run
```

### Linting
```bash
npm run lint
```

### Smoke Test
```bash
npm run test:run -- src/test/smoke.test.tsx
```

## 🏗️ Architecture & Technology Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with PostCSS
- **State Management:** React Hooks (`useDiagnosis`, `useFileUpload`)
- **Testing:** [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **API Communication:** Fetch API with a modular client-service pattern

### Directory Structure
- `src/components`: UI components organized by scope.
  - `features/`: Complex, domain-specific components (e.g., `DiagnosisReportSection`, `UploadSection`).
  - `layout/`: Shared structural components (e.g., `Header`).
  - `ui/`: Reusable, atomic UI components (e.g., `Button`, `Card`).
- `src/hooks`: Custom React hooks for business logic and state management.
- `src/services`: API clients and service layers (includes mock clients for local development).
- `src/types`: TypeScript definitions for API responses and domain models.
- `src/test`: Global test setup and smoke tests.

## 🛠️ Development Conventions

### TypeScript First
- Use strict typing for all components, hooks, and services.
- Define domain models and API responses in `src/types/`.

### Component Guidelines
- Prefer functional components with React Hooks.
- Keep components small and focused.
- Co-locate tests with components (e.g., `MyComponent.tsx` and `MyComponent.test.tsx`).

### Testing Strategy
- **Unit Tests:** For hooks and utility functions.
- **Component Tests:** For UI logic and accessibility.
- **Smoke Tests:** For critical user flows (e.g., resume upload to diagnosis report).

### Styling
- Use Tailwind CSS utility classes.
- Follow the design system tokens defined in `tailwind.config.js` (e.g., `primary` colors, `hero` font size).

## 📄 Documentation
- `docs/PRD.md`: Product Requirements Document.
- `TYPESCRIPT_CONVERSION.md`: Notes on the migration to TypeScript.
- `plan.md`: Development roadmap and status.
