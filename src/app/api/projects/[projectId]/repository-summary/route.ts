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

  return NextResponse.json({
    data: {
      forksCount: project.repositoryDetails?.forksCount ?? 0,
      openIssuesCount: project.repositoryDetails?.openIssuesCount ?? 0,
      stars: project.repositoryDetails?.stars ?? 0,
      languages: project.repositoryDetails?.languages ?? {},
    },
    timestamp: timestamp(),
  });
}
