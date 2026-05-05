# TalentLens Product Requirements Document

## 1. Product Positioning

TalentLens is an AI resume diagnosis tool for individual job seekers. The MVP focuses on helping users understand what is wrong with their current resume, which issues matter most, and what they should improve first.

The product should not initially position itself as a full resume builder or automatic resume writer. Its first promise is a clear, prioritized diagnosis report covering resume content, structure, formatting, and ATS readability.

## 2. Target Users

Primary users are individual job seekers who already have a resume but are unsure whether it is effective. They may be students, early-career candidates, career switchers, or professionals preparing for a new role.

These users need fast, practical feedback. They are not looking for a long consultation at first; they want to know whether their resume has obvious weaknesses and how to improve it.

## 3. Core Problem

Most job seekers struggle to evaluate their own resumes objectively. They may not know whether their resume is clear, whether the structure is professional, whether important information is missing, or whether the document is easy for recruiters and ATS systems to scan.

TalentLens solves this by turning resume review into a guided diagnosis process with clear priorities and actionable next steps.

## 4. MVP Goals

The MVP should allow a user to upload a resume and receive useful feedback within 3 minutes.

Success means the user can:

- Identify the top 3-5 resume issues.
- Understand why each issue matters.
- See which issues should be fixed first.
- Recognize formatting or ATS risks.
- Ask for more detail when they need a concrete example or rewrite direction.

## 5. MVP Scope

### In Scope

- Resume upload for PDF, DOC, and DOCX files.
- AI-generated diagnosis report.
- Overall resume summary.
- Prioritized issue list with severity levels.
- Formatting and ATS-readability checks.
- Suggestions for content clarity, structure, keywords, and missing sections.
- User actions to mark a suggestion as handled or dismissed.
- Request-based follow-up responses that can provide rewrite examples when the user asks.

### Out of Scope

- Full resume editor.
- Automatic final resume generation.
- Job application tracking.
- Direct integration with LinkedIn, 104, Indeed, or other job platforms.
- JD matching as the primary MVP workflow.
- Multi-user consultant, school, or HR workflows.

## 6. Core User Flow

1. User opens TalentLens.
2. User uploads a resume file.
3. System validates file type and upload status.
4. System analyzes the resume.
5. User receives a diagnosis report.
6. User reviews prioritized suggestions.
7. User marks suggestions as handled or dismissed.
8. User asks follow-up questions when they need more specific guidance.

## 7. Functional Requirements

### Resume Upload

The upload interface must support selecting a file and drag-and-drop upload. Accepted formats are PDF, DOC, and DOCX. The user should see upload progress and clear error messages for invalid files or failed uploads.

### Diagnosis Report

The report should include an overall assessment, a short summary, and a prioritized list of issues. Each issue should include a title, description, severity, category, reason, and suggested next action.

### Formatting and ATS Check

The system should review structure, section clarity, heading consistency, readability, file format, and likely ATS parsing risks. The report should explain issues in plain language.

### Follow-Up Guidance

Users may ask for more detail about a specific issue. The system can provide rewrite examples or more specific improvement advice, but this is secondary to the diagnosis report.

## 8. Non-Functional Requirements

- The main upload-to-report flow should feel fast and complete within roughly 3 minutes.
- Feedback should be direct, specific, and easy to act on.
- The UI should remain simple and focused on diagnosis, not editing.
- The system should avoid overclaiming hiring outcomes.
- Resume files and extracted content should be treated as sensitive user data.

## 9. Success Metrics

- Upload completion rate.
- Percentage of users who view the diagnosis report.
- Percentage of users who interact with at least one suggestion.
- Percentage of users who ask a follow-up question.
- User rating for whether the report helped them understand what to fix.
- Time from upload start to report completion.

## 10. Future Development

The next major direction is job-description matching. Users will be able to paste a JD and receive a gap analysis comparing their resume against the target role.

A later version can allow users to provide URLs from major job platforms. TalentLens can then help retrieve or structure the job description, when technically and legally feasible, to generate more accurate keyword, positioning, and qualification-gap feedback.

Other future opportunities include resume version comparison, exportable improvement checklists, saved diagnosis history, and more advanced rewrite assistance.
