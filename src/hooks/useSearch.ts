"use client";

import { useState } from "react";
import { askQuestion, runSearch } from "@/src/lib/client/apiClient";
import { AskResponse, SearchResponse } from "@/src/lib/client/types";

export const useSearch = () => {
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(
    null,
  );
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (payload: {
    query: string;
    tenant_id: string;
    topK?: number;
  }) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await runSearch(payload);
      setSearchResponse(response);
      return response;
    } catch (searchError) {
      const message =
        searchError instanceof Error ? searchError.message : "Search failed.";
      setError(message);
      throw searchError;
    } finally {
      setIsSearching(false);
    }
  };

  const ask = async (payload: {
    query: string;
    tenant_id: string;
    topK?: number;
  }) => {
    setIsAsking(true);
    setError(null);

    try {
      const response = await askQuestion(payload);
      setAskResponse(response);
      return response;
    } catch (askError) {
      const message =
        askError instanceof Error ? askError.message : "Ask failed.";
      setError(message);
      throw askError;
    } finally {
      setIsAsking(false);
    }
  };

  return {
    searchResponse,
    askResponse,
    isSearching,
    isAsking,
    error,
    search,
    ask,
  };
};
