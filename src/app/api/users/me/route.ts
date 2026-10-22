import { NextResponse } from "next/server";

/* goha.et is a read-only public directory — no accounts, no sessions. */
const timestamp = () => new Date().toISOString();

export async function GET() {
  return NextResponse.json(
    {
      error: "goha.et has no user accounts",
      statusCode: 401,
      timestamp: timestamp(),
    },
    { status: 401 }
  );
}
