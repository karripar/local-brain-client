"use client";

import { FormEvent, useState } from "react";
import { TextIngestResponse, UploadResponse } from "@/src/lib/client/types";

type UploadMode = "pdf" | "text";

type UploadPanelProps = {
  isUploading: boolean;
  error: string | null;
  latestResult: UploadResponse | null;
  latestTextResult: TextIngestResponse | null;
  onUpload: (payload: {
    file: File;
    source?: string;
    chunkSize?: number;
    chunkOverlap?: number;
  }) => Promise<void>;
  onTextIngest: (payload: {
    text: string;
    source?: string;
    docId?: string;
  }) => Promise<void>;
};

export const UploadPanel = ({
  isUploading,
  error,
  latestResult,
  latestTextResult,
  onUpload,
  onTextIngest,
}: UploadPanelProps) => {
  const [mode, setMode] = useState<UploadMode>("pdf");

  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState("");
  const [chunkSize, setChunkSize] = useState("800");
  const [chunkOverlap, setChunkOverlap] = useState("120");

  const [textBody, setTextBody] = useState("");
  const [textSource, setTextSource] = useState("");
  const [textDocId, setTextDocId] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    await onUpload({
      file,
      source: source.trim() || undefined,
      chunkSize: Number(chunkSize),
      chunkOverlap: Number(chunkOverlap),
    });

    setFile(null);
    event.currentTarget.reset();
  };

  const submitText = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onTextIngest({
      text: textBody,
      source: textSource.trim() || undefined,
      docId: textDocId.trim() || undefined,
    });

    setTextBody("");
    setTextSource("");
    setTextDocId("");
  };

  return (
    <section className="panel">
      <h2>Ingest Data</h2>
      <p className="panel-subtitle">
        Send a PDF file or plain text into Milvus.
      </p>

      <div className="tabs-bar" role="tablist" aria-label="Ingest modes">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "pdf"}
          className={`tab-btn ${mode === "pdf" ? "active" : ""}`}
          onClick={() => setMode("pdf")}
        >
          PDF
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "text"}
          className={`tab-btn ${mode === "text" ? "active" : ""}`}
          onClick={() => setMode("text")}
        >
          Text
        </button>
      </div>

      {mode === "pdf" && (
        <form className="stack" onSubmit={submit}>
          <label className="label" htmlFor="pdf-file">
            PDF file
          </label>
          <input
            id="pdf-file"
            type="file"
            accept="application/pdf"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
            }}
            required
          />

          <label className="label" htmlFor="source-input">
            Source label
          </label>
          <input
            id="source-input"
            placeholder="Optional source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />

          <div className="inline-grid">
            <div>
              <label className="label" htmlFor="chunk-size-input">
                Chunk size
              </label>
              <input
                id="chunk-size-input"
                type="number"
                min={50}
                max={5000}
                value={chunkSize}
                onChange={(event) => setChunkSize(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="chunk-overlap-input">
                Chunk overlap
              </label>
              <input
                id="chunk-overlap-input"
                type="number"
                min={0}
                max={1000}
                value={chunkOverlap}
                onChange={(event) => setChunkOverlap(event.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={isUploading || !file}>
            {isUploading ? "Uploading..." : "Upload and index"}
          </button>
        </form>
      )}

      {mode === "text" && (
        <form className="stack" onSubmit={submitText}>
          <label className="label" htmlFor="text-body-input">
            Text content
          </label>
          <textarea
            id="text-body-input"
            rows={6}
            value={textBody}
            onChange={(event) => setTextBody(event.target.value)}
            placeholder="Paste or type content to ingest"
            required
          />

          <label className="label" htmlFor="text-source-input">
            Source label
          </label>
          <input
            id="text-source-input"
            placeholder="Optional source"
            value={textSource}
            onChange={(event) => setTextSource(event.target.value)}
          />

          <label className="label" htmlFor="text-doc-id-input">
            Document ID
          </label>
          <input
            id="text-doc-id-input"
            placeholder="Optional; auto-generated if empty"
            value={textDocId}
            onChange={(event) => setTextDocId(event.target.value)}
          />

          <button type="submit" disabled={isUploading || !textBody.trim()}>
            {isUploading ? "Ingesting..." : "Ingest text"}
          </button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      {latestResult && (
        <div className="feedback success">
          <p>{latestResult.message}</p>
          <p>
            Chunks: <strong>{latestResult.chunks || 0}</strong>
          </p>
          <p>
            Stored as:{" "}
            <strong>{latestResult.file?.storedAs || "unknown"}</strong>
          </p>
        </div>
      )}

      {latestTextResult && (
        <div className="feedback success">
          <p>{latestTextResult.message || "Text ingested successfully."}</p>
          <p>
            Upserted chunks: <strong>{latestTextResult.upserted || 0}</strong>
          </p>
        </div>
      )}
    </section>
  );
};
