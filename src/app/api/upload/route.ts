import { NextResponse } from "next/server";
import { signedBackendRequest } from "@/src/lib/server/milvusProxy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const incoming = await request.formData();
    const file = incoming.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: 'A PDF file is required in field "file".' },
        { status: 400 },
      );
    }

    const payload = new FormData();
    payload.set("file", file, file.name);

    const source = incoming.get("source");
    const chunkSize = incoming.get("chunkSize");
    const chunkOverlap = incoming.get("chunkOverlap");

    if (typeof source === "string" && source.trim()) {
      payload.set("source", source.trim());
    }
    if (typeof chunkSize === "string" && chunkSize.trim()) {
      payload.set("chunkSize", chunkSize.trim());
    }
    if (typeof chunkOverlap === "string" && chunkOverlap.trim()) {
      payload.set("chunkOverlap", chunkOverlap.trim());
    }

    const result = await signedBackendRequest({
      method: "POST",
      path: "/api/v1/upload/pdf",
      formData: payload,
    });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed unexpectedly.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
