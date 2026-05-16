// @vitest-environment node
import { writeFile, mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { extractResumeText } from './resumeTextExtractor'

describe('extractResumeText', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'tl-extractor-'))
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  test('throws for unsupported MIME type text/plain', async () => {
    const filePath = join(tmpDir, 'resume.txt')
    await writeFile(filePath, 'not a real file')

    await expect(
      extractResumeText(filePath, 'text/plain')
    ).rejects.toThrow('Unsupported file type: text/plain')
  })

  test('throws for unsupported MIME type text/html', async () => {
    const filePath = join(tmpDir, 'resume.html')
    await writeFile(filePath, '<html/>')

    await expect(
      extractResumeText(filePath, 'text/html')
    ).rejects.toThrow('Unsupported file type: text/html')
  })
})
