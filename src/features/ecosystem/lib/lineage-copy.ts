export function buildLineageCoverageCopy(
  models: number,
  totalModels: number
): string {
  return `${models} of ${totalModels} models declare a base_model on Hugging Face.`;
}

export function buildLineageDescription(
  models: number,
  totalModels: number
): string {
  return `${buildLineageCoverageCopy(models, totalModels)} Explore the genealogy of Llama, Whisper, w2v-BERT and BERT descendants across the ecosystem.`;
}
