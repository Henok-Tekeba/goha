import { NextResponse } from "next/server";

import { categories } from "@/shared/lib/goha-data";

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json({
    data: categories,
    timestamp: new Date().toISOString(),
  });
}
