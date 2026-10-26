import type { IconType } from "react-icons";
import {
  PiBuildings,
  PiCpu,
  PiCube,
  PiFileText,
  PiGraph,
  PiTable,
  PiTag,
  PiTranslate,
  PiWaveform,
} from "react-icons/pi";

import { cn } from "@/shared/lib/utils";

/*
 * Phosphor equivalents for goha's asset taxonomy:
 * dataset → table, model → chip (task-specific where the task is obvious),
 * paper → file, publisher → buildings.
 */
const TASK_ICONS: Record<string, IconType> = {
  ASR: PiWaveform,
  TTS: PiWaveform,
  Translation: PiTranslate,
  Embeddings: PiGraph,
  NER: PiTag,
  "Image Generation": PiCube,
  Research: PiFileText,
};

const KIND_ICONS: Record<string, IconType> = {
  Dataset: PiTable,
  Research: PiFileText,
  Company: PiBuildings,
  Model: PiCpu,
};

export function iconForProject(
  kindLabel?: string | null,
  taskLabel?: string | null
): IconType {
  if (kindLabel === "Dataset") return PiTable;
  if (kindLabel === "Research") return PiFileText;
  if (kindLabel === "Company") return PiBuildings;
  if (kindLabel === "Model") {
    return TASK_ICONS[taskLabel ?? ""] ?? PiCpu;
  }
  return TASK_ICONS[taskLabel ?? ""] ?? KIND_ICONS[kindLabel ?? ""] ?? PiCube;
}

export function ProjectTypeIcon({
  kindLabel,
  taskLabel,
  className,
}: {
  kindLabel?: string | null;
  taskLabel?: string | null;
  className?: string;
}) {
  const Icon = iconForProject(kindLabel, taskLabel);
  return <Icon aria-hidden className={cn("size-[22px]", className)} />;
}
