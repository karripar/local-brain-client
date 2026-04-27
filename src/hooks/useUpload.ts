"use client";

import { useState } from "react";
import { ingestText, uploadPdf } from "@/src/lib/client/apiClient";
import { TextIngestResponse, UploadResponse } from "@/src/lib/client/types";

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<UploadResponse | null>(null);
  const [latestTextResult, setLatestTextResult] =
    useState<TextIngestResponse | null>(null);

  const submitUpload = async (payload: {
    file: File;
    source?: string;
    chunkSize?: number;
    chunkOverlap?: number;
  }) => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadPdf(payload);
      setLatestResult(result);
      return result;
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(message);
      throw uploadError;
    } finally {
      setIsUploading(false);
    }
  };

  const submitTextIngest = async (payload: {
    text: string;
    source?: string;
    docId?: string;
  }) => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await ingestText(payload);
      setLatestTextResult(result);
      return result;
    } catch (ingestError) {
      const message =
        ingestError instanceof Error
          ? ingestError.message
          : "Text ingest failed.";
      setError(message);
      throw ingestError;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    error,
    latestResult,
    latestTextResult,
    submitUpload,
    submitTextIngest,
  };
};
