import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TalentLensClient } from '../services/talentLensClient'
import type { UploadResumeResult } from '../types'
import { useFileUpload } from './useFileUpload'

const makeFile = (name: string, type: string, content = 'resume content') =>
  new File([content], name, { type })

const makeClient = (
  uploadResume: TalentLensClient['uploadResume'] = vi.fn(async (file: File) => ({
    resumeId: `resume-${file.name}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadedAt: '2026-04-30T10:00:00.000Z',
  })),
): TalentLensClient =>
  ({
    uploadResume,
    startAnalysis: vi.fn(),
    getAnalysisProgress: vi.fn(),
    getDiagnosisReport: vi.fn(),
    updateIssueStatus: vi.fn(),
    askFollowUp: vi.fn(),
  }) as TalentLensClient

describe('useFileUpload', () => {
  it('accepts PDF, DOC, and DOCX uploads and returns the resume ID', async () => {
    const uploadResume = vi.fn(async (file: File) => ({
      resumeId: `resume-${file.name}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: '2026-04-30T10:00:00.000Z',
    }))
    const { result } = renderHook(() => useFileUpload(makeClient(uploadResume)))
    let pdfResumeId = ''
    let docResumeId = ''
    let docxResumeId = ''

    await act(async () => {
      pdfResumeId = await result.current.uploadFile(makeFile('resume.pdf', 'application/pdf'))
      docResumeId = await result.current.uploadFile(makeFile('resume.doc', 'application/msword'))
      docxResumeId = await result.current.uploadFile(
        makeFile(
          'resume.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      )
    })

    expect(pdfResumeId).toBe('resume-resume.pdf')
    expect(docResumeId).toBe('resume-resume.doc')
    expect(docxResumeId).toBe('resume-resume.docx')
    expect(uploadResume).toHaveBeenCalledTimes(3)
  })

  it('rejects other file types with a clear message before calling the client', async () => {
    const uploadResume = vi.fn()
    const { result } = renderHook(() => useFileUpload(makeClient(uploadResume)))
    let caughtError: unknown

    await act(async () => {
      try {
        await result.current.uploadFile(makeFile('resume.txt', 'text/plain'))
      } catch (error) {
        caughtError = error
      }
    })

    expect(caughtError).toEqual(new Error('Upload a PDF, DOC, or DOCX resume.'))
    expect(uploadResume).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Upload a PDF, DOC, or DOCX resume.')
    expect(result.current.uploadProgress?.status).toBe('error')
  })

  it('rejects files over 10 MB with a clear message before calling the client', async () => {
    const uploadResume = vi.fn()
    const { result } = renderHook(() => useFileUpload(makeClient(uploadResume)))

    const oversizeContent = 'x'.repeat(10 * 1024 * 1024 + 1)
    const oversizeFile = makeFile('resume.pdf', 'application/pdf', oversizeContent)
    let caughtError: unknown

    await act(async () => {
      try {
        await result.current.uploadFile(oversizeFile)
      } catch (error) {
        caughtError = error
      }
    })

    expect(caughtError).toEqual(new Error('File is too large. Maximum size is 10 MB.'))
    expect(uploadResume).not.toHaveBeenCalled()
    expect(result.current.error).toBe('File is too large. Maximum size is 10 MB.')
    expect(result.current.uploadProgress?.status).toBe('error')
  })

  it('shows progress while uploading and marks success after the client resolves', async () => {
    let resolveUpload: (value: UploadResumeResult) => void
    const uploadResume = vi.fn(
      () =>
        new Promise<UploadResumeResult>((resolve) => {
          resolveUpload = resolve
        }),
    )
    const { result } = renderHook(() => useFileUpload(makeClient(uploadResume)))
    let uploadPromise: Promise<string>

    await act(async () => {
      uploadPromise = result.current.uploadFile(makeFile('resume.pdf', 'application/pdf'))
      await Promise.resolve()
    })

    expect(result.current.uploadProgress).toMatchObject({
      progress: 10,
      status: 'uploading',
    })

    await act(async () => {
      resolveUpload({
        resumeId: 'resume-delayed',
        fileName: 'resume.pdf',
        fileSize: 14,
        fileType: 'application/pdf',
        uploadedAt: '2026-04-30T10:00:00.000Z',
      })
      await uploadPromise
    })

    expect(result.current.uploadProgress).toMatchObject({
      progress: 100,
      status: 'success',
    })
  })

  it('does not include raw file content when upload fails', async () => {
    const rawResumeContent = 'SECRET RAW RESUME CONTENT'
    const { result } = renderHook(() =>
      useFileUpload(
        makeClient(
          vi.fn(async () => {
            throw new Error(`Upload failed after reading ${rawResumeContent}`)
          }),
        ),
      ),
    )
    let caughtError: unknown

    await act(async () => {
      try {
        await result.current.uploadFile(
          makeFile('resume.pdf', 'application/pdf', rawResumeContent),
        )
      } catch (error) {
        caughtError = error
      }
    })

    expect(caughtError).toEqual(new Error('Upload failed. Please try again.'))
    expect(result.current.error).toBe('Upload failed. Please try again.')
    expect(result.current.error).not.toContain(rawResumeContent)
    expect(result.current.uploadProgress?.error).not.toContain(rawResumeContent)
  })

  it('ignores stale completion and failure from an older upload after a newer upload starts', async () => {
    let resolveFirstUpload: (value: UploadResumeResult) => void
    let rejectFirstUpload: (reason: Error) => void
    const uploadResume = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<UploadResumeResult>((resolve, reject) => {
            resolveFirstUpload = resolve
            rejectFirstUpload = reject
          }),
      )
      .mockImplementationOnce(
        async (file: File): Promise<UploadResumeResult> => ({
          resumeId: `resume-${file.name}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: '2026-04-30T10:00:00.000Z',
        }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<UploadResumeResult>((resolve, reject) => {
            resolveFirstUpload = resolve
            rejectFirstUpload = reject
          }),
      )
      .mockImplementationOnce(
        async (file: File): Promise<UploadResumeResult> => ({
          resumeId: `resume-${file.name}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: '2026-04-30T10:00:00.000Z',
        }),
      )
    const { result } = renderHook(() => useFileUpload(makeClient(uploadResume)))

    let firstUploadPromise: Promise<string>
    await act(async () => {
      firstUploadPromise = result.current.uploadFile(makeFile('first.pdf', 'application/pdf'))
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.uploadFile(makeFile('second.pdf', 'application/pdf'))
    })

    expect(result.current.uploadProgress).toMatchObject({
      file: expect.objectContaining({ name: 'second.pdf' }),
      progress: 100,
      status: 'success',
    })

    await act(async () => {
      resolveFirstUpload({
        resumeId: 'resume-first.pdf',
        fileName: 'first.pdf',
        fileSize: 14,
        fileType: 'application/pdf',
        uploadedAt: '2026-04-30T10:00:00.000Z',
      })
      await firstUploadPromise
    })

    expect(result.current.error).toBeNull()
    expect(result.current.uploadProgress).toMatchObject({
      file: expect.objectContaining({ name: 'second.pdf' }),
      progress: 100,
      status: 'success',
    })

    let staleFailedUploadPromise: Promise<string>
    await act(async () => {
      staleFailedUploadPromise = result.current.uploadFile(
        makeFile('stale-failure.pdf', 'application/pdf'),
      )
      await Promise.resolve()
    })

    await act(async () => {
      await result.current.uploadFile(makeFile('latest.pdf', 'application/pdf'))
    })

    await act(async () => {
      rejectFirstUpload(new Error('stale failure'))

      try {
        await staleFailedUploadPromise
      } catch (error) {
        expect(error).toEqual(new Error('Upload failed. Please try again.'))
      }
    })

    expect(result.current.error).toBeNull()
    expect(result.current.uploadProgress).toMatchObject({
      file: expect.objectContaining({ name: 'latest.pdf' }),
      progress: 100,
      status: 'success',
    })
  })
})
