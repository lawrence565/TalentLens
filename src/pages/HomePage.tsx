import React, { useState } from 'react'
import type { FileUploadProgress } from '../types'
import { useDiagnosis } from '../hooks/useDiagnosis'
import Header from '../components/layout/Header'
import HeroSection from '../components/features/HeroSection'
import UploadSection from '../components/features/UploadSection'
import DiagnosisReportSection from '../components/features/DiagnosisReportSection'
import SuggestionsSection from '../components/features/SuggestionsSection'
import FollowUpPanel from '../components/features/FollowUpPanel'
import ReportRating from '../components/features/ReportRating'
import Card from '../components/ui/Card'
import type { Analytics } from '../services/analytics'
import { defaultAnalytics } from '../services/analytics'

const getUploadProgress = (
  file: File | null,
  status: ReturnType<typeof useDiagnosis>['status'],
  progress: number,
): FileUploadProgress | null => {
  if (!file || status === 'idle' || status === 'error' || status === 'timeout') {
    return null
  }

  return {
    file,
    progress,
    status: status === 'uploading' ? 'uploading' : 'success',
  }
}

interface HomePageProps {
  analytics?: Analytics
}

const HomePage: React.FC<HomePageProps> = ({ analytics = defaultAnalytics }) => {
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const {
    status,
    progress,
    report,
    error,
    slowAnalysisMessage,
    followUpResponse,
    submitResume,
    updateIssueStatus,
    askFollowUp,
    reset,
  } = useDiagnosis()

  const uploadProgress = getUploadProgress(currentFile, status, progress)

  const handleFileUpload = async (file: File): Promise<void> => {
    setCurrentFile(file)

    try {
      await submitResume(file)
    } catch {
      // useDiagnosis owns the user-facing error copy.
    }
  }

  const handleReset = (): void => {
    setCurrentFile(null)
    reset()
  }

  const showStatus = status === 'uploading' || status === 'analyzing' || status === 'slowAnalysis'
  const showError = (status === 'error' || status === 'timeout') && error
  const showReport = status === 'reportReady' && report

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} />

      <main>
        <HeroSection />

        <UploadSection onFileUpload={handleFileUpload} uploadProgress={uploadProgress} />

        {showStatus && (
          <section className="mx-auto max-w-2xl px-6 pb-8" aria-live="polite">
            <Card>
              <p className="text-sm font-semibold text-gray-900">
                {status === 'uploading' ? 'Uploading resume' : 'Analyzing resume'}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {status === 'slowAnalysis' && slowAnalysisMessage
                  ? slowAnalysisMessage
                  : 'Preparing your diagnosis report.'}
              </p>
              <div className="mt-4 h-2 rounded-full bg-gray-200">
                <div
                  role="progressbar"
                  aria-label="Diagnosis progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-2 rounded-full bg-primary-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </Card>
          </section>
        )}

        {showError && (
          <section className="mx-auto max-w-2xl px-6 pb-8">
            <Card variant="error">
              <div role="alert">
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
              <button
                onClick={handleReset}
                className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>
            </Card>
          </section>
        )}

        {showReport && (
          <>
            <DiagnosisReportSection report={report} />
            <ReportRating reportId={report.id} analytics={analytics} />
            <SuggestionsSection report={report} updateIssueStatus={updateIssueStatus} />
            <FollowUpPanel
              report={report}
              followUpResponse={followUpResponse}
              askFollowUp={askFollowUp}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default HomePage
