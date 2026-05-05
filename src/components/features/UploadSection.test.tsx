import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FileUploadProgress } from '../../types'
import UploadSection from './UploadSection'

const makeFile = (name: string, type: string, content = 'resume content') =>
  new File([content], name, { type })

describe('UploadSection', () => {
  it('starts upload from the file picker', async () => {
    const user = userEvent.setup()
    const onFileUpload = vi.fn(async () => undefined)
    const file = makeFile('resume.pdf', 'application/pdf')

    render(<UploadSection onFileUpload={onFileUpload} uploadProgress={null} />)

    await user.upload(screen.getByLabelText(/choose resume file/i), file)

    expect(onFileUpload).toHaveBeenCalledWith(file)
  })

  it('starts upload from drag and drop', () => {
    const onFileUpload = vi.fn(async () => undefined)
    const file = makeFile('resume.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

    render(<UploadSection onFileUpload={onFileUpload} uploadProgress={null} />)

    fireEvent.drop(screen.getByLabelText(/resume upload dropzone/i), {
      dataTransfer: {
        files: [file],
      },
    })

    expect(onFileUpload).toHaveBeenCalledWith(file)
  })

  it('shows upload progress', () => {
    const file = makeFile('resume.doc', 'application/msword')
    const uploadProgress: FileUploadProgress = {
      file,
      progress: 40,
      status: 'uploading',
    }

    render(<UploadSection onFileUpload={vi.fn()} uploadProgress={uploadProgress} />)

    expect(screen.getByText('resume.doc')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: /upload progress/i })).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
  })

  it('shows upload errors and retries the failed file', async () => {
    const user = userEvent.setup()
    const file = makeFile('resume.pdf', 'application/pdf')
    const uploadProgress: FileUploadProgress = {
      file,
      progress: 10,
      status: 'error',
      error: 'Upload failed. Please try again.',
    }
    const onFileUpload = vi.fn(async () => undefined)

    render(<UploadSection onFileUpload={onFileUpload} uploadProgress={uploadProgress} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed. Please try again.')

    await user.click(screen.getByRole('button', { name: /retry upload/i }))

    await waitFor(() => {
      expect(onFileUpload).toHaveBeenCalledWith(file)
    })
  })

  it('does not render raw file content inside error messages', () => {
    const rawResumeContent = 'SECRET RAW RESUME CONTENT'
    const file = makeFile('resume.pdf', 'application/pdf', rawResumeContent)
    const uploadProgress: FileUploadProgress = {
      file,
      progress: 10,
      status: 'error',
      error: 'Upload failed. Please try again.',
    }

    render(<UploadSection onFileUpload={vi.fn()} uploadProgress={uploadProgress} />)

    expect(screen.queryByText(rawResumeContent)).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).not.toHaveTextContent(rawResumeContent)
  })
})
