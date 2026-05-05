import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export type TalentLensDatabase = DatabaseSync

export const createDatabase = (databasePath: string): TalentLensDatabase => {
  if (databasePath !== ':memory:') {
    mkdirSync(dirname(databasePath), { recursive: true })
  }

  const database = new DatabaseSync(databasePath)
  database.exec('pragma foreign_keys = on')

  return database
}
