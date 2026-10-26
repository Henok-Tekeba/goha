import type { CategoryType } from "@/shared/types/category.type";
import type { TechStackType } from "@/shared/types/tech-stack.type";

import { mockPublicId } from "@/mocks/public-id.mock";

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
  tech(
    "tst_00000000000000000000000000000001",
    "Amharic",
    "/langs/amharic.svg",
    "LANGUAGE"
  ),
  tech(
    "tst_00000000000000000000000000000002",
    "Afaan Oromo",
    "/langs/afaan-oromo.svg",
    "LANGUAGE"
  ),
  tech(
    "tst_00000000000000000000000000000003",
    "Tigrinya",
    "/langs/tigrinya.svg",
    "LANGUAGE"
  ),
  tech(
    "tst_00000000000000000000000000000004",
    "Ge'ez",
    "/langs/geez.svg",
    "LANGUAGE"
  ),
  tech(
    "tst_00000000000000000000000000000005",
    "Somali",
    "/langs/somali.svg",
    "LANGUAGE"
  ),
  tech(
    "tst_00000000000000000000000000000006",
    "Wolaytta",
    "/langs/wolaytta.svg",
    "LANGUAGE"
  ),
  tech(
    "tst_00000000000000000000000000000007",
    "Sidaamu Afoo",
    "/langs/sidaamu-afoo.svg",
    "LANGUAGE"
  ),
  tech(
    "tst_00000000000000000000000000000008",
    "English",
    "/langs/english.svg",
    "LANGUAGE"
  ),
  tech(
    "tst_00000000000000000000000000000033",
    "Safetensors",
    "/langs/sym-shield.svg",
    "TECH"
  ),
  tech(
    "tst_00000000000000000000000000000034",
    "Transformers",
    "/langs/sym-layers.svg",
    "TECH"
  ),
  tech(
    "tst_00000000000000000000000000000035",
    "TensorBoard",
    "/langs/sym-chart.svg",
    "TECH"
  ),
  tech(
    "tst_00000000000000000000000000000036",
    "PEFT",
    "/langs/sym-link.svg",
    "TECH"
  ),
  tech(
    "tst_00000000000000000000000000000037",
    "PyTorch",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg",
    "TECH"
  ),
  tech(
    "tst_00000000000000000000000000000038",
    "Diffusers",
    "/langs/sym-spark.svg",
    "TECH"
  ),
];
