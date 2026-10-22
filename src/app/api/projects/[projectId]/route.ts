import { NextResponse } from "next/server";

import { projects } from "@/shared/lib/goha-data";

export const revalidate = 3600;

const timestamp = () => new Date().toISOString();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    return NextResponse.json(
      { error: "Project not found", statusCode: 404, timestamp: timestamp() },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: project, timestamp: timestamp() });
}
