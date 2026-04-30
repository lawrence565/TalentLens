import { useState, useCallback, useRef } from "react";
import type { FileUploadProgress } from "../types";
import { createMockTalentLensClient } from "../services/mockTalentLensClient";
import type { TalentLensClient } from "../services/talentLensClient";

const SUPPORTED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const SUPPORTED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];
const UNSUPPORTED_FILE_MESSAGE = "Upload a PDF, DOC, or DOCX resume.";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const FILE_TOO_LARGE_MESSAGE = "File is too large. Maximum size is 10 MB.";
const UPLOAD_FAILED_MESSAGE = "Upload failed. Please try again.";

interface UseFileUploadReturn {
  uploadProgress: FileUploadProgress | null;
  uploadFile: (file: File) => Promise<string>;
  resetUpload: () => void;
  error: string | null;
}

const isSupportedResumeFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();

  return (
    SUPPORTED_RESUME_TYPES.has(file.type) ||
    SUPPORTED_RESUME_EXTENSIONS.some((extension) => fileName.endsWith(extension))
  );
};

const isWithinSizeLimit = (file: File): boolean => file.size <= MAX_FILE_SIZE_BYTES;

export const useFileUpload = (
  client: TalentLensClient = createMockTalentLensClient()
): UseFileUploadReturn => {
  const [uploadProgress, setUploadProgress] =
    useState<FileUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latestUploadId = useRef(0);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const uploadId = latestUploadId.current + 1;
    latestUploadId.current = uploadId;
    setError(null);

    if (!isSupportedResumeFile(file)) {
      setError(UNSUPPORTED_FILE_MESSAGE);
      setUploadProgress({
        file,
        progress: 0,
        status: "error",
        error: UNSUPPORTED_FILE_MESSAGE,
      });

      throw new Error(UNSUPPORTED_FILE_MESSAGE);
    }

    if (!isWithinSizeLimit(file)) {
      setError(FILE_TOO_LARGE_MESSAGE);
      setUploadProgress({
        file,
        progress: 0,
        status: "error",
        error: FILE_TOO_LARGE_MESSAGE,
      });

      throw new Error(FILE_TOO_LARGE_MESSAGE);
    }

    setUploadProgress({
      file,
      progress: 10,
      status: "uploading",
    });

    try {
      const upload = await client.uploadResume(file);

      if (latestUploadId.current === uploadId) {
        setUploadProgress((prev) =>
          prev ? { ...prev, status: "success", progress: 100 } : null
        );
      }

      return upload.resumeId;
    } catch (err) {
      const errorMessage = UPLOAD_FAILED_MESSAGE;

      if (latestUploadId.current === uploadId) {
        setError(errorMessage);
        setUploadProgress((prev) =>
          prev
            ? {
                ...prev,
                status: "error",
                error: errorMessage,
              }
            : null
        );
      }

      throw new Error(errorMessage);
    }
  }, [client]);

  const resetUpload = useCallback(() => {
    setUploadProgress(null);
    setError(null);
  }, []);

  return {
    uploadProgress,
    uploadFile,
    resetUpload,
    error,
  };
};
