"use client";

import { useMemo, useState } from "react";
import { ReadDocument } from "@/src/lib/client/types";

type DeleteDocumentsPanelProps = {
  documents: ReadDocument[];
  onDelete: (docIds: string[]) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
  message: string | null;
};

export const DeleteDocumentsPanel = ({
  documents,
  onDelete,
  isDeleting,
  error,
  message,
}: DeleteDocumentsPanelProps) => {
  const safeDocuments = useMemo(
    () => (Array.isArray(documents) ? documents : []),
    [documents],
  );
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const visibleSelectedDocIds = useMemo(
    () =>
      selectedDocIds.filter((docId) =>
        safeDocuments.some((doc) => doc.doc_id === docId),
      ),
    [safeDocuments, selectedDocIds],
  );

  const toggleDocId = (docId: string) => {
    setSelectedDocIds((current) =>
      current.includes(docId)
        ? current.filter((item) => item !== docId)
        : [...current, docId],
    );
  };

  const selectAll = () => {
    setSelectedDocIds(safeDocuments.map((doc) => doc.doc_id));
  };

  const clearSelection = () => {
    setSelectedDocIds([]);
  };

  const submitDelete = async () => {
    if (!visibleSelectedDocIds.length) {
      return;
    }

    await onDelete(visibleSelectedDocIds);
    setSelectedDocIds([]);
  };

  return (
    <section className="panel delete-panel">
      <div className="panel-head">
        <div>
          <h2>Delete documents</h2>
          <p className="panel-subtitle">
            Remove selected chunks from Milvus and their matching PDF upload
            when safe.
          </p>
        </div>
        <div className="actions">
          <button
            className="secondary"
            type="button"
            onClick={selectAll}
            disabled={!safeDocuments.length || isDeleting}
          >
            Select page
          </button>
          <button
            className="secondary"
            type="button"
            onClick={clearSelection}
            disabled={!selectedDocIds.length || isDeleting}
          >
            Clear
          </button>
        </div>
      </div>

      <p className="muted">
        Selected {visibleSelectedDocIds.length} of {safeDocuments.length}{" "}
        documents on this page.
      </p>

      {error && <p className="error-text">{error}</p>}
      {message && <p className="muted">{message}</p>}

      <div className="delete-doc-list">
        {safeDocuments.map((doc) => (
          <label key={doc.doc_id} className="delete-doc-item">
            <input
              type="checkbox"
              checked={visibleSelectedDocIds.includes(doc.doc_id)}
              onChange={() => toggleDocId(doc.doc_id)}
            />
            <span>
              <strong>{doc.doc_id}</strong>
              <span className="muted">{doc.source || "unknown source"}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="actions">
        <button
          type="button"
          onClick={submitDelete}
          disabled={isDeleting || !visibleSelectedDocIds.length}
        >
          {isDeleting ? "Deleting..." : "Delete selected"}
        </button>
      </div>
    </section>
  );
};
