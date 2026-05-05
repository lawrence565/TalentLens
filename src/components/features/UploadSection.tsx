import React, { useRef, useState } from "react";
import type { FileUploadProgress } from "../../types";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Icon from "../ui/Icon";

interface UploadSectionProps {
  onFileUpload: (file: File) => Promise<void>;
  uploadProgress: FileUploadProgress | null;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  onFileUpload,
  uploadProgress,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadSelectedFile = (file?: File): void => {
    if (file) {
      void onFileUpload(file);
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-6 pb-12">
      <Card
        className={`border-dashed text-center transition-colors ${
          dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300"
        }`}
      >
        <div
          aria-label="Resume upload dropzone"
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            uploadSelectedFile(event.dataTransfer.files[0]);
          }}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Icon name="file" size={28} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-gray-900">
            Upload your resume
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Drop a PDF, DOC, or DOCX file here, or choose one from your computer.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            aria-label="Choose resume file"
            className="sr-only"
            onChange={(event) => uploadSelectedFile(event.target.files?.[0])}
          />
          <Button
            className="mt-6"
            size="lg"
            onClick={() => inputRef.current?.click()}
            loading={uploadProgress?.status === "uploading"}
          >
            Upload Resume
          </Button>

          {uploadProgress && (
            <div className="mt-6 text-left">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{uploadProgress.file.name}</span>
                <span>{uploadProgress.progress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200">
                <div
                  role="progressbar"
                  aria-label="Upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={uploadProgress.progress}
                  className="h-2 rounded-full bg-primary-500 transition-all"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              {uploadProgress.status === "error" && uploadProgress.error && (
                <div
                  role="alert"
                  className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <p>{uploadProgress.error}</p>
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="outline"
                    onClick={() => uploadSelectedFile(uploadProgress.file)}
                  >
                    Retry upload
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </section>
  );
};

export default UploadSection;
