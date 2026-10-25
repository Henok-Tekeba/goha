/**
 * Task classification order:
 *   1. Hugging Face pipeline_tag
 *   2. model-index task.type
 *   3. the existing type_label/badge fallback
 * No model-name or base-model guessing.
 */
export function modelIndexTaskTypes(model) {
  const results = Array.isArray(model?.eval_results) ? model.eval_results : [];
  return [
    ...new Set(
      results
        .map((result) => result?.task?.type)
        .filter((type) => typeof type === "string" && type.length > 0)
    ),
  ];
}

export function modelTaskType(model) {
  if (model?.pipeline_tag) return String(model.pipeline_tag);
  const [indexTask] = modelIndexTaskTypes(model);
  if (indexTask) return indexTask;
  return String(model?.type_label || model?.badge || "").trim();
}

export function isAsrModel(model) {
  const type = modelTaskType(model).toLowerCase();
  return type === "automatic-speech-recognition" || type === "asr";
}
