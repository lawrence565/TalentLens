import type { DiagnosisProvider } from './diagnosisProvider'
import { fallbackDiagnosisProvider } from './fallbackDiagnosisProvider'
import { createClaudeDiagnosisProvider } from './claudeDiagnosisProvider'

interface ProviderConfig {
  diagnosisProvider: string | undefined
  anthropicApiKey: string | undefined
}

export const createProvider = ({ diagnosisProvider, anthropicApiKey }: ProviderConfig): DiagnosisProvider => {
  if (!diagnosisProvider || diagnosisProvider === 'fallback') {
    return fallbackDiagnosisProvider
  }

  if (diagnosisProvider === 'claude') {
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY must be set when DIAGNOSIS_PROVIDER=claude')
    }
    return createClaudeDiagnosisProvider({ apiKey: anthropicApiKey })
  }

  throw new Error(`Unknown DIAGNOSIS_PROVIDER: ${diagnosisProvider}`)
}
