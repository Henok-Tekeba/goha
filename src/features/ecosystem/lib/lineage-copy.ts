export function buildLineageCoverageCopy(
  models: number,
  totalModels: number
): string {
  return `${models} of ${totalModels} models declare a base_model on Hugging Face.`;
}
