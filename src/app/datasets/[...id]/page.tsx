import { fetchDatasetById, fetchDatasetSnapshots } from "@/lib/github";
import DatasetDetail from "@/components/DatasetDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  const dataset = await fetchDatasetById(id.join("/"));
  return {
    title: dataset ? `${dataset.name} — goha.et` : "Dataset not found — goha.et",
    description: dataset?.desc || dataset?.description || "Ethiopian AI dataset",
  };
}

export default async function DatasetPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  const fullId = id.join("/");
  const [dataset, allSnapshots] = await Promise.all([
    fetchDatasetById(fullId),
    fetchDatasetSnapshots(),
  ]);
  const timeline = allSnapshots?.[fullId] ?? null;
  return <DatasetDetail item={dataset} timeline={timeline} />;
}
