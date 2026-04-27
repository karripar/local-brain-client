import {
  AskResponse,
  HealthResponse,
  ReadResponse,
  SearchPayload,
  SearchResponse,
  TextIngestPayload,
  TextIngestResponse,
  UploadResponse,
} from "@/src/lib/client/types";

const parseJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return { message: text } as T;
  }
};

const throwIfNotOk = (response: Response, message?: string) => {
  if (!response.ok) {
    throw new Error(message || `Request failed with status ${response.status}`);
  }
};

const normalizeDocuments = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as { data?: unknown; results?: unknown };

    if (Array.isArray(record.data)) {
      return record.data;
    }

    if (Array.isArray(record.results)) {
      return record.results;
    }
  }

  return [];
};

export const uploadPdf = async (payload: {
  file: File;
  source?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}) => {
  const form = new FormData();
  form.set("file", payload.file, payload.file.name);

  if (payload.source) {
    form.set("source", payload.source);
  }
  if (typeof payload.chunkSize === "number") {
    form.set("chunkSize", String(payload.chunkSize));
  }
  if (typeof payload.chunkOverlap === "number") {
    form.set("chunkOverlap", String(payload.chunkOverlap));
  }

  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  const body = await parseJson<UploadResponse & { message?: string }>(response);
  throwIfNotOk(response, body.message || "Upload request failed.");

  return body;
};

export const ingestText = async (payload: TextIngestPayload) => {
  const normalizedText = payload.text.trim();
  if (!normalizedText) {
    throw new Error("Text input cannot be empty.");
  }

  const generatedDocId = payload.docId?.trim() || `text-${Date.now()}`;

  const response = await fetch("/api/vector/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [
        {
          doc_id: generatedDocId,
          text: normalizedText,
          source: payload.source?.trim() || undefined,
        },
      ],
    }),
  });

  const body = await parseJson<TextIngestResponse & { message?: string }>(
    response,
  );
  throwIfNotOk(response, body.message || "Text ingest request failed.");

  return body;
};

export const runSearch = async (payload: SearchPayload) => {
  const response = await fetch("/api/vector/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await parseJson<SearchResponse & { message?: string }>(response);
  throwIfNotOk(response, body.message || "Search request failed.");

  return body;
};

export const askQuestion = async (payload: SearchPayload) => {
  const response = await fetch("/api/vector/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await parseJson<AskResponse & { message?: string }>(response);
  throwIfNotOk(response, body.message || "Ask request failed.");

  return body;
};

export const fetchDocuments = async () => {
  const response = await fetch("/api/vector/read", { cache: "no-store" });
  const body = await parseJson<ReadResponse & { message?: string }>(response);
  throwIfNotOk(response, body.message || "Read request failed.");

  const payload = body as unknown as { documents?: unknown };

  return {
    documents: normalizeDocuments(payload.documents),
  } as ReadResponse;
};

export const fetchHealth = async () => {
  const response = await fetch("/api/health", { cache: "no-store" });
  const body = await parseJson<HealthResponse>(response);

  if (!response.ok) {
    return {
      ok: false,
      message: (body as { message?: string }).message || "Health check failed.",
    };
  }

  return body;
};
