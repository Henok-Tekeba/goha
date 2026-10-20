import type { CategoryType } from "@/shared/types/category.type";
import type { TechStackType } from "@/shared/types/tech-stack.type";

import { mockPublicId } from "../public-id.mock";

const now = new Date("2026-01-01T00:00:00.000Z").toISOString();

const tech = (
  id: string,
  name: string,
  iconUrl: string,
  type: TechStackType["type"]
): TechStackType => ({
  id,
  name,
  iconUrl,
  type,
  createdAt: now,
  updatedAt: now,
});

export const categories: CategoryType[] = [
  { id: mockPublicId("cat", 1), name: "Model" },
  { id: mockPublicId("cat", 2), name: "Dataset" },
  { id: mockPublicId("cat", 3), name: "Company" },
  { id: mockPublicId("cat", 4), name: "Research" },
  { id: mockPublicId("cat", 5), name: "ASR" },
  { id: mockPublicId("cat", 6), name: "Translation" },
  { id: mockPublicId("cat", 7), name: "LLM" },
  { id: mockPublicId("cat", 8), name: "NER" },
  { id: mockPublicId("cat", 9), name: "Embeddings" },
  { id: mockPublicId("cat", 10), name: "Other" },
];

export const techStacks: TechStackType[] = [
  tech(mockPublicId("tst", 1), "Amharic", "/langs/amharic.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 2), "English", "/langs/english.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 3), "Tigrinya", "/langs/tigrinya.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 4), "Afaan Oromo", "/langs/afaan-oromo.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 5), "Sidaamu Afoo", "/langs/sidaamu-afoo.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 6), "Wolayttattoo", "/langs/wolayttattoo.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 7), "Somali", "/langs/somali.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 8), "Safetensors", "/langs/sym-shield.svg", "TECH"),
  tech(mockPublicId("tst", 9), "Transformers", "/langs/sym-layers.svg", "TECH"),
  tech(mockPublicId("tst", 10), "TensorBoard", "/langs/sym-chart.svg", "TECH"),
  tech(mockPublicId("tst", 11), "PyTorch", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg", "TECH"),
  tech(mockPublicId("tst", 12), "PEFT", "/langs/sym-link.svg", "TECH"),
  tech(mockPublicId("tst", 13), "Diffusers", "/langs/sym-spark.svg", "TECH"),
];
