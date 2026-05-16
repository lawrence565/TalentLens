import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import mammoth from 'mammoth'

const require = createRequire(import.meta.url)

export async function extractResumeText(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>
    const buffer = await readFile(filePath)
    const result = await pdfParse(buffer)
    return result.text.trim()
  }

  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const buffer = await readFile(filePath)
    const result = await mammoth.extractRawText({ buffer })
    return result.value.trim()
  }

  throw new Error(`Unsupported file type: ${mimeType}`)
}
