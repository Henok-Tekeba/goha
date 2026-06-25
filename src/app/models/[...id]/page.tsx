import { fetchModelById, fetchModels } from "@/lib/github";
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
  const model = await fetchModelById(id.join("/"));
  let related: any[] = [];
  if (model) {
    const { data } = await fetchModels();
    related = (data as any[]).filter(
      (m: any) => m.org === model.org && m.id !== model.id
    ).slice(0, 4);
  }
  return <ModelDetail item={model} related={related} />;
}
