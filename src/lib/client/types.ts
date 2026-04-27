export type UploadResponse = {
  message: string;
  file?: {
    originalName: string;
    storedAs: string;
    path: string;
    sizeBytes: number;
  };
  chunks?: number;
  upserted?: number;
  source?: string;
};

export type TextIngestResponse = {
  upserted: number;
  message?: string;
};

export type SearchResult = {
  doc_id: string;
  text: string;
  source?: string;
  score?: number;
  upload_link?: string;
};

export type SearchResponse = {
  results: SearchResult[];
  context: string;
};

export type AskSource = {
  doc_id: string;
  source?: string;
  score?: number;
  upload_link?: string;
};

export type AskResponse = {
  answer: string;
  sources: AskSource[];
};

export type ReadDocument = {
  doc_id: string;
  text: string;
  source?: string;
};

export type ReadResponse = {
  documents: ReadDocument[];
};

export type HealthResponse = {
  ok: boolean;
  collections?: string[];
  message?: string;
};

export type SearchPayload = {
  query: string;
  tenant_id: string;
  topK?: number;
};

export type TextIngestPayload = {
  text: string;
  source?: string;
  docId?: string;
};
