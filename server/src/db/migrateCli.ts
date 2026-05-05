import { createDatabase } from './connection'
import { migrateDatabase } from './migrate'

const databasePath = process.env.TALENTLENS_DATABASE_PATH ?? './data/talentlens.sqlite'
const database = createDatabase(databasePath)

migrateDatabase(database)
database.close()

console.log(`Migrated TalentLens database at ${databasePath}`)
