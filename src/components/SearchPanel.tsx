"use client";

import { FormEvent, useState } from "react";
import { AskResponse, SearchResponse } from "@/src/lib/client/types";

type SearchPanelProps = {
  searchResponse: SearchResponse | null;
  askResponse: AskResponse | null;
  isSearching: boolean;
  isAsking: boolean;
  error: string | null;
  onSearch: (payload: {
    query: string;
    tenant_id: string;
    topK: number;
  }) => Promise<void>;
  onAsk: (payload: {
    query: string;
    tenant_id: string;
    topK: number;
  }) => Promise<void>;
};

export const SearchPanel = ({
  searchResponse,
  askResponse,
  isSearching,
  isAsking,
  error,
  onSearch,
  onAsk,
}: SearchPanelProps) => {
  const [query, setQuery] = useState("");
  const [tenantId, setTenantId] = useState("demo-tenant");
  const [topK, setTopK] = useState(5);

  const submitSearch = async (event: FormEvent) => {
    event.preventDefault();
    await onSearch({ query, tenant_id: tenantId, topK });
  };

  const submitAsk = async () => {
    await onAsk({ query, tenant_id: tenantId, topK });
  };

  return (
    <section className="panel">
      <h2>Search and Ask</h2>
      <p className="panel-subtitle">
        Run semantic retrieval and inspect ranked chunks.
      </p>

      <form className="stack" onSubmit={submitSearch}>
        <label className="label" htmlFor="tenant-id-input">
          Tenant ID
        </label>
        <input
          id="tenant-id-input"
          value={tenantId}
          onChange={(event) => setTenantId(event.target.value)}
          placeholder="Required by backend"
          required
        />

        <label className="label" htmlFor="query-input">
          Query
        </label>
        <textarea
          id="query-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask about your uploaded knowledge"
          rows={4}
          required
        />

        <label className="label" htmlFor="topk-input">
          Top K
        </label>
        <input
          id="topk-input"
          type="range"
          min={1}
          max={20}
          value={topK}
          onChange={(event) => setTopK(Number(event.target.value))}
        />
        <p className="muted">Retrieval depth: {topK}</p>

        <div className="actions">
          <button type="submit" disabled={isSearching || !query.trim()}>
            {isSearching ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={submitAsk}
            disabled={isAsking || !query.trim()}
          >
            {isAsking ? "Thinking..." : "Ask with RAG"}
          </button>
        </div>
      </form>

      {error && <p className="error-text">{error}</p>}

      {askResponse && (
        <div className="feedback">
          <h3>Answer</h3>
          <p>{askResponse.answer}</p>
          {!!askResponse.sources?.length && (
            <div className="results-stack">
              <p className="muted">Sources</p>
              {askResponse.sources.map((source) => (
                <article key={source.doc_id} className="result-card">
                  <p className="result-head">
                    <span>{source.doc_id}</span>
                    <span>score {source.score?.toFixed(3) ?? "n/a"}</span>
                  </p>
                  <p className="muted">Source: {source.source || "unknown"}</p>
                  {source.upload_link ? (
                    <a
                      href={source.upload_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source PDF
                    </a>
                  ) : (
                    <p className="muted">No upload link available</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {searchResponse && (
        <div className="results-stack">
          <h3>Search results ({searchResponse.results.length})</h3>
          {searchResponse.results.map((result) => (
            <article key={result.doc_id} className="result-card">
              <p className="result-head">
                <span>{result.doc_id}</span>
                <span>score {result.score?.toFixed(3) ?? "n/a"}</span>
              </p>
              <p className="muted">Source: {result.source || "unknown"}</p>
              <p>{result.text}</p>
              {result.upload_link && (
                <a href={result.upload_link} target="_blank" rel="noreferrer">
                  Open source PDF
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
