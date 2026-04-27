import { NextResponse } from "next/server";
import { signedBackendRequest } from "@/src/lib/server/milvusProxy";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await signedBackendRequest({
      method: "GET",
      path: "/api/v1/vector/read",
    });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Read request failed unexpectedly.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
