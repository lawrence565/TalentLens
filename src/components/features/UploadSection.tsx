import React, { useRef, useState } from 'react'
import type { FileUploadProgress } from '../../types'
import Button from '../ui/Button'
import Progress from '../ui/Progress'

interface UploadSectionProps {
  onFileUpload: (file: File) => Promise<void>
  uploadProgress: FileUploadProgress | null
}

const FileIcon: React.FC<{ color?: string }> = ({ color = 'currentColor' }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
)

const CheckIcon: React.FC<{ color?: string }> = ({ color = 'currentColor' }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const UploadSection: React.FC<UploadSectionProps> = ({ onFileUpload, uploadProgress }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const uploadSelectedFile = (file?: File): void => {
    if (file) void onFileUpload(file)
  }

  const isUploading = uploadProgress?.status === 'uploading'
  const isSuccess = uploadProgress?.status === 'success'
  const isError = uploadProgress?.status === 'error'

  const containerClasses = [
    'rounded-[14px] border-2 p-9 text-center transition-all duration-200',
    isError
      ? 'bg-high-50 border-high-200'
      : isSuccess
      ? 'bg-low-50 border-low-200'
      : isUploading
      ? 'bg-white border-brand-200'
      : dragActive
      ? 'bg-brand-50 border-dashed border-brand-500'
      : 'bg-n-50 border-dashed border-n-300',
  ].join(' ')

  const iconBg = isUploading || isSuccess || isError ? '' : 'bg-brand-50'
  const iconColor = isError
    ? 'oklch(0.562 0.208 18)'
    : isSuccess
    ? 'oklch(0.622 0.150 158)'
    : dragActive
    ? 'oklch(0.508 0.200 265)'
    : 'oklch(0.718 0.009 265)'

  const title = isError
    ? 'Upload failed'
    : isSuccess
    ? 'Uploaded successfully'
    : isUploading
    ? `Uploading ${uploadProgress.file.name}`
    : dragActive
    ? 'Drop to upload'
    : 'Upload your resume'

  const subtitle = isError
    ? uploadProgress?.error ?? 'Please try again.'
    : isSuccess
    ? 'Analysis in progress — this takes about 30 seconds.'
    : isUploading
    ? 'Preparing for analysis…'
    : dragActive
    ? 'Release to start your resume diagnosis.'
    : 'Drop a PDF, DOC, or DOCX file here, or browse your files.'

  const titleColor = isError
    ? 'text-high-700'
    : isSuccess
    ? 'text-low-700'
    : 'text-n-900'

  return (
    <section className="mx-auto max-w-[480px] px-6 pb-12">
      <div
        className={containerClasses}
        aria-label="Resume upload dropzone"
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          uploadSelectedFile(e.dataTransfer.files[0])
        }}
      >
        <div className={`mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-xl ${iconBg}`}>
          {isSuccess ? (
            <CheckIcon color={iconColor} />
          ) : (
            <FileIcon color={iconColor} />
          )}
        </div>

        <h2 className={`font-sans text-base font-bold ${titleColor}`}>{title}</h2>
        <p className="mt-1.5 font-sans text-sm text-n-500 leading-relaxed">{subtitle}</p>

        {(isUploading || isSuccess) && (
          <div className="mt-5">
            <Progress
              value={uploadProgress.progress}
              label={uploadProgress.file.name}
              variant="brand"
              ariaLabel="Upload progress"
            />
          </div>
        )}

        {isError && (
          <div role="alert" className="mt-4">
            <p className="mb-3 font-sans text-sm text-high-700">{uploadProgress?.error}</p>
            <Button
              variant="danger"
              size="md"
              onClick={() => uploadSelectedFile(uploadProgress?.file)}
            >
              Retry upload
            </Button>
          </div>
        )}

        {!isUploading && !isSuccess && !isError && (
          <Button className="mt-5" size="md" onClick={() => inputRef.current?.click()}>
            Browse Files
          </Button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          aria-label="Choose resume file"
          className="sr-only"
          onChange={(e) => uploadSelectedFile(e.target.files?.[0])}
        />
      </div>
    </section>
  )
}

export default UploadSection
