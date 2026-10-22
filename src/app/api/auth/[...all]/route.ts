import { NextResponse } from "next/server";

/* Auth is not part of goha.et (read-only public directory). */
const timestamp = () => new Date().toISOString();

function notAvailable() {
  return NextResponse.json(
    {
      error: "Authentication is not available on goha.et",
      statusCode: 404,
      timestamp: timestamp(),
    },
    { status: 404 }
  );
}

export async function GET() {
  return notAvailable();
}

export async function POST() {
  return notAvailable();
}
