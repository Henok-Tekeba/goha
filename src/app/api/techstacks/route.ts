import { NextResponse } from "next/server";

import { techStacks } from "@/shared/lib/goha-data";

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json({
    data: techStacks,
    timestamp: new Date().toISOString(),
  });
}
