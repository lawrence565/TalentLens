import { badRequest } from './errors'

export const supportedResumeMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export const supportedIssueStatuses = new Set(['open', 'handled', 'dismissed'])

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024

export const ensureString = (value: unknown, message: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw badRequest(message)
  }

  return value.trim()
}

export const ensureBoolean = (value: unknown, message: string): boolean => {
  if (typeof value !== 'boolean') {
    throw badRequest(message)
  }

  return value
}

export const ensureRating = (value: unknown): 1 | 2 | 3 | 4 | 5 => {
  if (![1, 2, 3, 4, 5].includes(Number(value))) {
    throw badRequest('Invalid rating.')
  }

  return Number(value) as 1 | 2 | 3 | 4 | 5
}
