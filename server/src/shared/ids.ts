import { randomUUID } from 'node:crypto'

export const createId = (prefix: string) => `${prefix}-${randomUUID()}`

export const nowIso = () => new Date().toISOString()
