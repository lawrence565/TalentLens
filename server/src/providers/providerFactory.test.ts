// @vitest-environment node
import { describe, test, expect, vi } from 'vitest'

vi.mock('./claudeDiagnosisProvider', () => ({
  createClaudeDiagnosisProvider: vi.fn().mockReturnValue({ generateReport: vi.fn() }),
}))

vi.mock('./fallbackDiagnosisProvider', () => ({
  fallbackDiagnosisProvider: { generateReport: vi.fn() },
}))

import { createProvider } from './providerFactory'
import { createClaudeDiagnosisProvider } from './claudeDiagnosisProvider'

describe('createProvider', () => {
  test('returns fallback provider when DIAGNOSIS_PROVIDER is undefined', () => {
    const provider = createProvider({ diagnosisProvider: undefined, anthropicApiKey: undefined })
    expect(provider).toBeDefined()
    expect(createClaudeDiagnosisProvider).not.toHaveBeenCalled()
  })

  test('returns fallback provider when DIAGNOSIS_PROVIDER is "fallback"', () => {
    const provider = createProvider({ diagnosisProvider: 'fallback', anthropicApiKey: undefined })
    expect(provider).toBeDefined()
    expect(createClaudeDiagnosisProvider).not.toHaveBeenCalled()
  })

  test('returns Claude provider when DIAGNOSIS_PROVIDER is "claude"', () => {
    const provider = createProvider({ diagnosisProvider: 'claude', anthropicApiKey: 'sk-test' })
    expect(provider).toBeDefined()
    expect(createClaudeDiagnosisProvider).toHaveBeenCalledWith({ apiKey: 'sk-test' })
  })

  test('throws when DIAGNOSIS_PROVIDER is "claude" but ANTHROPIC_API_KEY is missing', () => {
    expect(() =>
      createProvider({ diagnosisProvider: 'claude', anthropicApiKey: undefined })
    ).toThrow('ANTHROPIC_API_KEY must be set when DIAGNOSIS_PROVIDER=claude')
  })

  test('throws for unknown DIAGNOSIS_PROVIDER values', () => {
    expect(() =>
      createProvider({ diagnosisProvider: 'gpt4', anthropicApiKey: undefined })
    ).toThrow('Unknown DIAGNOSIS_PROVIDER: gpt4')
  })
})
