import { mkdirSync } from 'node:fs'
import { createApp } from './app'
import { createAnalysisWorker } from './analyses/analysisWorker'
import { createDatabase } from './db/connection'
import { migrateDatabase } from './db/migrate'
import { createProvider } from './providers/providerFactory'

const databasePath = process.env.TALENTLENS_DATABASE_PATH ?? './data/talentlens.sqlite'
const uploadDir = process.env.TALENTLENS_UPLOAD_DIR ?? './uploads'
const port = Number(process.env.PORT ?? 5174)

mkdirSync(uploadDir, { recursive: true })
const database = createDatabase(databasePath)
migrateDatabase(database)

const provider = createProvider({
  diagnosisProvider: process.env.DIAGNOSIS_PROVIDER,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
})

const worker = createAnalysisWorker({ database, provider })

setInterval(() => {
  worker.processNext().catch(() => {
    // Keep server errors generic for this MVP.
  })
}, 500)

createApp({ database, uploadDir }).listen(port, () => {
  console.log(`TalentLens API listening on http://localhost:${port}`)
})
