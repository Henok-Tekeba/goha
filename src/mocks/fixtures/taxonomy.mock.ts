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
  { id: mockPublicId("cat", 1), name: "ASR" },
  { id: mockPublicId("cat", 2), name: "Translation" },
  { id: mockPublicId("cat", 3), name: "LLM" },
  { id: mockPublicId("cat", 4), name: "NER" },
  { id: mockPublicId("cat", 5), name: "Embeddings" },
  { id: mockPublicId("cat", 6), name: "Dataset" },
  { id: mockPublicId("cat", 7), name: "Company" },
  { id: mockPublicId("cat", 8), name: "Research" },
  { id: mockPublicId("cat", 9), name: "Other" },
];

export const techStacks: TechStackType[] = [
  tech(mockPublicId("tst", 1), "Amharic", "/langs/amharic.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 2), "English", "/langs/english.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 3), "Tigrinya", "/langs/tigrinya.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 4), "Afaan Oromo", "/langs/afaan-oromo.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 5), "Sidaamu Afoo", "/langs/sidaamu-afoo.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 6), "Orm", "/langs/orm.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 7), "Wolayttattoo", "/langs/wolayttattoo.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 8), "Amh", "/langs/amh.svg", "LANGUAGE"),
  tech(mockPublicId("tst", 9), "Transformers", "/langs/transformers.svg", "TECH"),
  tech(mockPublicId("tst", 10), "Pytorch", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg", "TECH"),
  tech(mockPublicId("tst", 11), "Keras", "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/keras/keras-original.svg", "TECH"),
  tech(mockPublicId("tst", 12), "Onnx", "/langs/onnx.svg", "TECH"),
];
