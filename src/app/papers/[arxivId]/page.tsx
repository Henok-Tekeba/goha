import { fetchPaperByArxivId } from "@/lib/github";
import PaperDetail from "@/components/PaperDetail";

export async function generateMetadata({ params }: { params: Promise<{ arxivId: string }> }) {
  const { arxivId } = await params;
  const paper = await fetchPaperByArxivId(arxivId);
  return {
    title: paper ? `${paper.title || paper.name} — goha.et` : "Paper not found — goha.et",
    description: paper?.abstract || paper?.desc || "Ethiopian AI research paper",
  };
}

export default async function PaperPage({ params }: { params: Promise<{ arxivId: string }> }) {
  const { arxivId } = await params;
  const paper = await fetchPaperByArxivId(arxivId);
  return <PaperDetail item={paper} />;
}
