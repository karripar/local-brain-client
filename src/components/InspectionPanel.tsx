"use client";

import { useMemo, useState } from "react";
import { ReadDocument } from "@/src/lib/client/types";

type InspectionPanelProps = {
  documents: ReadDocument[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
};

export const InspectionPanel = ({
  documents,
  isLoading,
  error,
  onRefresh,
}: InspectionPanelProps) => {
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const [sourceFilter, setSourceFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");

  const filtered = useMemo(() => {
    const sourceNeedle = sourceFilter.trim().toLowerCase();
    const textNeedle = textFilter.trim().toLowerCase();

    return safeDocuments.filter((doc) => {
      const sourceMatch = sourceNeedle
        ? (doc.source || "").toLowerCase().includes(sourceNeedle)
        : true;
      const textMatch = textNeedle
        ? doc.text.toLowerCase().includes(textNeedle)
        : true;

      return sourceMatch && textMatch;
    });
  }, [safeDocuments, sourceFilter, textFilter]);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Information inspection</h2>
          <p className="panel-subtitle">
            Inspect indexed chunks and filter by source or content.
          </p>
        </div>
        <button className="secondary" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="inline-grid">
        <div>
          <label className="label" htmlFor="source-filter-input">
            Source filter
          </label>
          <input
            id="source-filter-input"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            placeholder="Filter by source"
          />
        </div>
        <div>
          <label className="label" htmlFor="text-filter-input">
            Text filter
          </label>
          <input
            id="text-filter-input"
            value={textFilter}
            onChange={(event) => setTextFilter(event.target.value)}
            placeholder="Filter by content"
          />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <p className="muted">
        Showing {filtered.length} of {safeDocuments.length} chunks
      </p>

      <div className="inspection-list">
        {filtered.slice(0, 120).map((doc) => (
          <article key={doc.doc_id} className="result-card">
            <p className="result-head">
              <span>{doc.doc_id}</span>
            </p>
            <p className="muted">Source: {doc.source || "unknown"}</p>
            <p>{doc.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
