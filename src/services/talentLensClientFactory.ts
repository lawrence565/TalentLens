import { createApiTalentLensClient } from './apiTalentLensClient'
import { createMockTalentLensClient } from './mockTalentLensClient'
import type { TalentLensClient } from './talentLensClient'

export const createTalentLensClient = (): TalentLensClient => {
  const apiBaseUrl = import.meta.env.VITE_TALENTLENS_API_BASE_URL as string | undefined

  if (apiBaseUrl) {
    return createApiTalentLensClient(apiBaseUrl)
  }

  return createMockTalentLensClient()
}
