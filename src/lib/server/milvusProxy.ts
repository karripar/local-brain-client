import crypto from "node:crypto";

export type SignedBackendRequest = {
  method: "GET" | "POST" | "DELETE";
  path: string;
  jsonBody?: unknown;
  formData?: FormData;
};

export type SignedBackendResponse = {
  ok: boolean;
  status: number;
  data: unknown;
};

const normalizeBaseUrl = (url: string) => {
  const trimmed = url.trim().replace(/\/+$/, "");

  if (trimmed.endsWith("/api/v1")) {
    return trimmed.slice(0, -"/api/v1".length);
  }

  return trimmed;
};

const configuredBaseUrl =
  process.env.MILVUS_BRAIN_BASE_URL?.trim() ||
  process.env.SERVER_ADDRESS?.trim() ||
  "http://localhost:3006";

const BACKEND_BASE_URL = normalizeBaseUrl(configuredBaseUrl);
const SOURCE_SECRET = process.env.SOURCE_SECRET?.trim() || "";

const getSignedHeaders = (method: string, path: string, bodyText: string) => {
  const timestamp = Date.now().toString();
  const payload = [method.toUpperCase(), path, timestamp, bodyText].join("\n");

  const signature = crypto
    .createHmac("sha256", SOURCE_SECRET)
    .update(payload)
    .digest("hex");

  return {
    "x-signature": signature,
    "x-timestamp": timestamp,
    "x-signing-path": path,
  };
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const signedBackendRequest = async ({
  method,
  path,
  jsonBody,
  formData,
}: SignedBackendRequest): Promise<SignedBackendResponse> => {
  if (!SOURCE_SECRET) {
    return {
      ok: false,
      status: 500,
      data: {
        message:
          "SOURCE_SECRET is not configured on mb-client. Add it to your environment.",
      },
    };
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const headers = new Headers();
  let body: BodyInit | undefined;
  let bodyText = "";

  if (formData) {
    body = formData;
  } else if (jsonBody !== undefined) {
    bodyText = JSON.stringify(jsonBody);
    body = bodyText;
    headers.set("Content-Type", "application/json");
  }

  const signedHeaders = getSignedHeaders(method, normalizedPath, bodyText);
  Object.entries(signedHeaders).forEach(([key, value]) =>
    headers.set(key, value),
  );

  const targetUrl = new URL(normalizedPath, BACKEND_BASE_URL).toString();

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const data = await parseResponseBody(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};
