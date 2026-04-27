"use client";

import { useCallback, useState } from "react";
import { fetchDocuments } from "@/src/lib/client/apiClient";
import { ReadDocument } from "@/src/lib/client/types";

export const useInspection = () => {
  const [documents, setDocuments] = useState<ReadDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchDocuments();
      setDocuments(result.documents || []);
    } catch (readError) {
      const message =
        readError instanceof Error
          ? readError.message
          : "Could not load documents.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    documents,
    isLoading,
    error,
    refreshDocuments,
  };
};
