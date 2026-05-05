import type { DiagnosisProvider } from './diagnosisProvider'

export const fallbackDiagnosisProvider: DiagnosisProvider = {
  async generateReport() {
    return {
      overallScore: 72,
      summary:
        'The resume has a solid foundation. The next best improvements are clearer impact bullets, simpler structure, and more precise role language.',
      issues: [
        {
          id: 'draft-impact-bullets',
          title: 'Lead with measurable impact',
          severity: 'high',
          category: 'content_clarity',
          reason:
            'Several bullets describe responsibilities without showing scope, results, or business value.',
          nextAction:
            'Rewrite the top three experience bullets to include metrics, tools, and outcomes.',
          status: 'open',
          priority: 1,
        },
        {
          id: 'draft-section-order',
          title: 'Move core experience above supporting details',
          severity: 'medium',
          category: 'structure',
          reason:
            'The strongest recent role and skills summary should appear before less relevant sections.',
          nextAction:
            'Place the professional summary, skills, and recent experience before projects and coursework.',
          status: 'open',
          priority: 2,
        },
        {
          id: 'draft-role-keywords',
          title: 'Add accurate role language',
          severity: 'medium',
          category: 'keywords',
          reason:
            'The resume underuses product analytics and stakeholder-management terms that match the target role.',
          nextAction:
            'Add accurate terms from target role descriptions where they reflect real experience.',
          status: 'open',
          priority: 3,
        },
        {
          id: 'draft-achievements-section',
          title: 'Make selected achievements easier to scan',
          severity: 'low',
          category: 'missing_sections',
          reason:
            'A compact achievements section would make leadership and cross-functional results easier to find.',
          nextAction:
            'Add two or three achievements that connect directly to the roles you plan to pursue.',
          status: 'open',
          priority: 4,
        },
        {
          id: 'draft-ats-formatting',
          title: 'Simplify formatting for automated parsing',
          severity: 'high',
          category: 'formatting',
          additionalCategories: ['ats_risk'],
          reason:
            'Dense columns and decorative separators may make headings and dates harder for parsers to read.',
          nextAction:
            'Use single-column sections, standard headings, and plain text bullets for the work-history area.',
          status: 'open',
          priority: 5,
        },
      ],
      atsChecks: [
        {
          id: 'draft-ats-parsing',
          type: 'parsing',
          label: 'Parsing risk',
          status: 'warning',
          reason: 'Columns may be read out of order by automated parsers.',
          nextAction: 'Use a single-column layout for experience and education.',
        },
        {
          id: 'draft-ats-headings',
          type: 'headings',
          label: 'Headings',
          status: 'pass',
          reason: 'Most section headings use standard resume language.',
          nextAction: 'Keep section names direct and conventional.',
        },
        {
          id: 'draft-ats-readability',
          type: 'readability',
          label: 'Readability',
          status: 'warning',
          reason: 'Some bullets run long and bury the result at the end.',
          nextAction: 'Keep bullets to one or two lines with the result near the start.',
        },
        {
          id: 'draft-ats-file-format',
          type: 'file_format',
          label: 'File format',
          status: 'pass',
          reason: 'The uploaded format is supported for this analysis.',
          nextAction: 'Keep a DOCX version available when a plain document is requested.',
        },
      ],
      followUpPrompts: [
        'How should I rewrite the first experience bullet?',
        'Which accurate keywords fit product analyst roles?',
      ],
    }
  },
}
