import { fetchModelById, fetchModels, fetchModelSnapshots } from "@/lib/github";
import ModelDetail from "@/components/ModelDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  const model = await fetchModelById(id.join("/"));
  return {
    title: model ? `${model.name} — goha.et` : "Model not found — goha.et",
    description: model?.desc || model?.description || "Ethiopian AI model",
  };
}

export default async function ModelPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  const fullId = id.join("/");
  const [model, allSnapshots] = await Promise.all([
    fetchModelById(fullId),
    fetchModelSnapshots(),
  ]);
  let related: any[] = [];
  let timeline = null;
  if (model) {
    const { data } = await fetchModels();
    related = (data as any[]).filter(
      (m: any) => m.org === model.org && m.id !== model.id
    ).slice(0, 4);
    timeline = allSnapshots?.[fullId] ?? null;
  }
  return <ModelDetail item={model} related={related} timeline={timeline} />;
}
