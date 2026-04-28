"use client";

import { useCallback, useState } from "react";
import { fetchDocuments } from "@/src/lib/client/apiClient";
import { ReadDocument, ReadPagination } from "@/src/lib/client/types";

const PAGE_SIZE = 12;

export const useInspection = () => {
  const [documents, setDocuments] = useState<ReadDocument[]>([]);
  const [pagination, setPagination] = useState<ReadPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDocuments = useCallback(
    async (requestedPage?: number) => {
      const nextPage = requestedPage ?? page;
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchDocuments({
          page: nextPage,
          limit: PAGE_SIZE,
        });
        setDocuments(result.documents || []);
        setPagination(result.pagination);
        setPage(result.pagination.page);
      } catch (readError) {
        const message =
          readError instanceof Error
            ? readError.message
            : "Could not load documents.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [page],
  );

  return {
    documents,
    pagination,
    page,
    setPage,
    isLoading,
    error,
    refreshDocuments,
  };
};
