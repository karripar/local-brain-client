import { NextResponse } from "next/server";
import { signedBackendRequest } from "@/src/lib/server/milvusProxy";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await signedBackendRequest({
      method: "GET",
      path: "/milvus/health",
    });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Health check failed unexpectedly.";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
