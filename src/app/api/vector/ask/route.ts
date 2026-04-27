import { NextResponse } from "next/server";
import { signedBackendRequest } from "@/src/lib/server/milvusProxy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await signedBackendRequest({
      method: "POST",
      path: "/api/v1/vector/ask",
      jsonBody: body,
    });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ask request failed unexpectedly.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
