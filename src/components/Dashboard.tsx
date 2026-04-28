"use client";

import { useEffect, useState } from "react";
import { HealthPill } from "@/src/components/HealthPill";
import { DeleteDocumentsPanel } from "@/src/components/DeleteDocumentsPanel";
import { InspectionPanel } from "@/src/components/InspectionPanel";
import { SearchPanel } from "@/src/components/SearchPanel";
import { UploadPanel } from "@/src/components/UploadPanel";
import { useBackendHealth } from "@/src/hooks/useBackendHealth";
import { useInspection } from "@/src/hooks/useInspection";
import { useSearch } from "@/src/hooks/useSearch";
import { useUpload } from "@/src/hooks/useUpload";
import { deleteDocuments } from "@/src/lib/client/apiClient";

type DashboardTab = "ingest" | "explore";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("ingest");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { health, isLoading: isHealthLoading, check } = useBackendHealth();
  const {
    documents,
    pagination,
    setPage,
    isLoading: isInspectionLoading,
    error: inspectionError,
    refreshDocuments,
  } = useInspection();
  const {
    isUploading,
    error: uploadError,
    latestResult,
    latestTextResult,
    submitUpload,
    submitTextIngest,
  } = useUpload();
  const {
    searchResponse,
    askResponse,
    isSearching,
    isAsking,
    error: searchError,
    search,
    ask,
  } = useSearch();

  useEffect(() => {
    void refreshDocuments();
  }, [refreshDocuments]);

  const handleDeleteDocuments = async (docIds: string[]) => {
    if (!docIds.length) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    setDeleteMessage(null);

    try {
      const result = await deleteDocuments(docIds);
      const removedUploads = result.removedUploads?.length
        ? ` Removed ${result.removedUploads.length} upload file(s).`
        : "";
      const skippedUploads = result.skippedUploads?.length
        ? ` Skipped ${result.skippedUploads.length} upload file(s) that still had chunks.`
        : "";

      setDeleteMessage(
        `Deleted ${result.deleted} document(s).${removedUploads}${skippedUploads}`,
      );
      await refreshDocuments();
    } catch (deleteErr) {
      const message =
        deleteErr instanceof Error ? deleteErr.message : "Delete failed.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Milvus Brain Client</p>
        <h1>Upload, inspect, search, and filter your indexed knowledge.</h1>
        <div className="hero-actions">
          <HealthPill
            isLoading={isHealthLoading}
            ok={Boolean(health.ok)}
            collections={health.collections}
          />
          <button
            className="secondary"
            onClick={check}
            disabled={isHealthLoading}
          >
            Re-check backend
          </button>
        </div>
      </header>

      <nav className="tabs-bar" aria-label="Dashboard sections">
        <button
          type="button"
          className={`tab-btn ${activeTab === "ingest" ? "active" : ""}`}
          onClick={() => setActiveTab("ingest")}
        >
          Ingest
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "explore" ? "active" : ""}`}
          onClick={() => setActiveTab("explore")}
        >
          Explore
        </button>
      </nav>

      {activeTab === "ingest" && (
        <section className="tab-panel">
          <UploadPanel
            isUploading={isUploading}
            error={uploadError}
            latestResult={latestResult}
            latestTextResult={latestTextResult}
            onUpload={async (payload) => {
              await submitUpload(payload);
              await refreshDocuments();
            }}
            onTextIngest={async (payload) => {
              await submitTextIngest(payload);
              await refreshDocuments();
            }}
          />
        </section>
      )}

      {activeTab === "explore" && (
        <section className="tab-panel">
          <SearchPanel
            searchResponse={searchResponse}
            askResponse={askResponse}
            isSearching={isSearching}
            isAsking={isAsking}
            error={searchError}
            onSearch={async (payload) => {
              await search(payload);
            }}
            onAsk={async (payload) => {
              await ask(payload);
            }}
          />

          <InspectionPanel
            documents={documents}
            pagination={pagination}
            isLoading={isInspectionLoading}
            error={inspectionError}
            onRefresh={refreshDocuments}
            onPageChange={setPage}
          />

          <DeleteDocumentsPanel
            documents={documents}
            onDelete={handleDeleteDocuments}
            isDeleting={isDeleting}
            error={deleteError}
            message={deleteMessage}
          />
        </section>
      )}
    </main>
  );
};
