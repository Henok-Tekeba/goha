import { type NextRequest, NextResponse } from "next/server";

import { filterProjects } from "@/shared/lib/goha-data";

export const revalidate = 3600;

const timestamp = () => new Date().toISOString();

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const size = Math.min(
    100,
    Math.max(1, Number(sp.get("per_page") ?? 20) || 20)
  );

  const results = filterProjects(sp);
  const slice = results.slice((page - 1) * size, page * size);

  return NextResponse.json({
    data: slice,
    pagination: {
      total: results.length,
      lastPage: Math.max(1, Math.ceil(results.length / size)),
      currentPage: page,
      size,
    },
    timestamp: timestamp(),
  });
}
