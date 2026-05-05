// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

describe('Docker local stack configuration', () => {
  test('defines separate frontend and backend services on a shared local network', () => {
    const compose = readFileSync('docker-compose.yml', 'utf8')

    expect(compose).toContain('frontend:')
    expect(compose).toContain('backend:')
    expect(compose).toContain('talentlens-local')
    expect(compose).toContain('5173:5173')
    expect(compose).toContain('5174:5174')
    expect(compose).toContain('VITE_TALENTLENS_API_BASE_URL: http://localhost:5174/api')
    expect(compose).toContain('TALENTLENS_DATABASE_PATH: /app/data/talentlens.sqlite')
    expect(compose).toContain('TALENTLENS_UPLOAD_DIR: /app/uploads')
  })

  test('keeps frontend and backend Dockerfiles isolated', () => {
    const frontendDockerfile = readFileSync('Dockerfile.frontend', 'utf8')
    const backendDockerfile = readFileSync('Dockerfile.backend', 'utf8')
    const packageJson = readFileSync('package.json', 'utf8')

    expect(frontendDockerfile).toContain('npm", "run", "dev:web:docker')
    expect(packageJson).toContain('vite --host 0.0.0.0')
    expect(backendDockerfile).toContain('npm", "run", "start:server')
    expect(backendDockerfile).toContain('EXPOSE 5174')
  })
})
