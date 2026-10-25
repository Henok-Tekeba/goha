import type { IconType } from "react-icons";
import {
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlinePencilSquare,
  HiOutlineTableCells,
} from "react-icons/hi2";

import { EXTERNAL_LINKS } from "@/shared/lib/constants";

export type SubmissionKind =
  | "model"
  | "dataset"
  | "paper"
  | "org"
  | "benchmark"
  | "correction"
  | "feedback";

export type SubmissionValues = Record<string, string>;

export interface SubmissionField {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  inputMode?: "text" | "url" | "numeric";
  hint?: string;
  full?: boolean;
}

export interface SubmissionType {
  value: SubmissionKind;
  label: string;
  issueLabel: string;
  titlePrefix: string;
  actionLabel: string;
  icon: IconType;
  fields: SubmissionField[];
}

const SUBMITTER_FIELD: SubmissionField = {
  name: "submitter",
  label: "Credit (optional)",
  placeholder: "Your name or handle",
};

export const SUBMISSION_TYPES: SubmissionType[] = [
  {
    value: "model",
    label: "Model",
    issueLabel: "goha-submit",
    titlePrefix: "Model",
    actionLabel: "Open model issue",
    icon: HiOutlineCube,
    fields: [
      {
        name: "name",
        label: "Model name",
        placeholder: "e.g. Llama-3.2-1B-Amharic-Instruct",
        required: true,
      },
      {
        name: "url",
        label: "Model URL",
        placeholder: "https://huggingface.co/...",
        inputMode: "url",
        required: true,
      },
      {
        name: "org",
        label: "Organization / author",
        placeholder: "e.g. EthioNLP, iCog Labs",
      },
      {
        name: "languages",
        label: "Languages",
        placeholder: "Amharic, Afaan Oromo, Tigrinya",
      },
      {
        name: "tasks",
        label: "Tasks",
        placeholder: "ASR, LLM, Translation, NER",
      },
      {
        name: "description",
        label: "Description",
        placeholder: "One sentence a creator could quote.",
        textarea: true,
        full: true,
      },
      SUBMITTER_FIELD,
    ],
  },
  {
    value: "dataset",
    label: "Dataset",
    issueLabel: "goha-submit",
    titlePrefix: "Dataset",
    actionLabel: "Open dataset issue",
    icon: HiOutlineTableCells,
    fields: [
      {
        name: "name",
        label: "Dataset name",
        placeholder: "e.g. Amharic Speech Corpus v0.2",
        required: true,
      },
      {
        name: "url",
        label: "Dataset URL",
        placeholder: "https://huggingface.co/datasets/...",
        inputMode: "url",
        required: true,
      },
      {
        name: "org",
        label: "Organization / author",
        placeholder: "e.g. Dataset.ET",
      },
      {
        name: "languages",
        label: "Languages",
        placeholder: "Amharic, Afaan Oromo",
      },
      {
        name: "tasks",
        label: "Tasks",
        placeholder: "ASR, TTS, LLM, Benchmark",
      },
      {
        name: "description",
        label: "Description",
        placeholder: "Hours, rows, speakers — one line.",
        textarea: true,
        full: true,
      },
      SUBMITTER_FIELD,
    ],
  },
  {
    value: "paper",
    label: "Research",
    issueLabel: "goha-submit",
    titlePrefix: "Paper",
    actionLabel: "Open paper issue",
    icon: HiOutlineDocumentText,
    fields: [
      {
        name: "name",
        label: "Paper title",
        placeholder: "Full paper title",
        required: true,
      },
      {
        name: "url",
        label: "Paper URL",
        placeholder: "https://arxiv.org/abs/...",
        inputMode: "url",
        required: true,
      },
      {
        name: "authors",
        label: "Authors",
        placeholder: "Comma-separated",
      },
      {
        name: "languages",
        label: "Languages",
        placeholder: "Amharic, Tigrinya",
      },
      {
        name: "tasks",
        label: "Tasks",
        placeholder: "ASR, LLM, Benchmark",
      },
      {
        name: "description",
        label: "Description",
        placeholder: "One sentence summary.",
        textarea: true,
        full: true,
      },
      SUBMITTER_FIELD,
    ],
  },
  {
    value: "org",
    label: "Organization",
    issueLabel: "goha-submit",
    titlePrefix: "Organization",
    actionLabel: "Open organization issue",
    icon: HiOutlineBuildingOffice2,
    fields: [
      {
        name: "name",
        label: "Organization name",
        placeholder: "e.g. Addis AI",
        required: true,
      },
      {
        name: "url",
        label: "Website",
        placeholder: "https://...",
        inputMode: "url",
      },
      {
        name: "orgKind",
        label: "Type",
        placeholder: "company, lab or individual",
      },
      {
        name: "languages",
        label: "Languages",
        placeholder: "Amharic, Afaan Oromo",
      },
      {
        name: "description",
        label: "Description",
        placeholder: "One sentence.",
        textarea: true,
        full: true,
      },
      SUBMITTER_FIELD,
    ],
  },
  {
    value: "benchmark",
    label: "Benchmark",
    issueLabel: "goha-benchmark",
    titlePrefix: "Benchmark",
    actionLabel: "Open benchmark issue",
    icon: HiOutlineChartBar,
    fields: [
      {
        name: "modelName",
        label: "Model",
        placeholder: "Model name",
        required: true,
      },
      {
        name: "url",
        label: "Model URL",
        placeholder: "https://huggingface.co/...",
        inputMode: "url",
      },
      {
        name: "dataset",
        label: "Dataset",
        placeholder: "Evaluation dataset",
      },
      {
        name: "metric",
        label: "Metric",
        placeholder: "WER, BLEU, accuracy, latency",
        required: true,
      },
      {
        name: "value",
        label: "Result",
        placeholder: "e.g. 12.4% or 0.82",
        required: true,
      },
      {
        name: "sourceUrl",
        label: "Source",
        placeholder: "Model card, paper or leaderboard URL",
        inputMode: "url",
        required: true,
        hint: "A result without a public source won't be published.",
      },
      {
        name: "languages",
        label: "Languages",
        placeholder: "Amharic",
      },
      SUBMITTER_FIELD,
    ],
  },
  {
    value: "correction",
    label: "Correction",
    issueLabel: "goha-correction",
    titlePrefix: "Correction",
    actionLabel: "Open correction issue",
    icon: HiOutlinePencilSquare,
    fields: [
      {
        name: "name",
        label: "What needs correcting?",
        placeholder: "e.g. Wrong license on Amharic Speech Corpus",
        required: true,
      },
      {
        name: "pageUrl",
        label: "goha page URL",
        placeholder: "https://goha.enoch.et/projects/...",
        inputMode: "url",
        required: true,
      },
      {
        name: "issue",
        label: "What is wrong?",
        placeholder: "Describe the current, incorrect value.",
        textarea: true,
        required: true,
        full: true,
      },
      {
        name: "correction",
        label: "What should it say?",
        placeholder: "The corrected value.",
        textarea: true,
        full: true,
      },
      {
        name: "sourceUrl",
        label: "Source",
        placeholder: "Link that proves the correction",
        inputMode: "url",
      },
      SUBMITTER_FIELD,
    ],
  },
  {
    value: "feedback",
    label: "Feedback",
    issueLabel: "feedback",
    titlePrefix: "Feedback",
    actionLabel: "Open feedback issue",
    icon: HiOutlineChatBubbleLeftRight,
    fields: [
      {
        name: "message",
        label: "Your feedback",
        placeholder:
          "What would make goha more useful for you or your community?",
        textarea: true,
        required: true,
        full: true,
      },
      {
        name: "pageUrl",
        label: "Page this is about",
        placeholder: "Optional — paste a goha URL",
        inputMode: "url",
      },
      SUBMITTER_FIELD,
    ],
  },
];

export function getSubmissionType(kind: SubmissionKind): SubmissionType {
  return (
    SUBMISSION_TYPES.find((type) => type.value === kind) ?? SUBMISSION_TYPES[0]
  );
}

export function getMissingFields(
  kind: SubmissionKind,
  values: SubmissionValues
): SubmissionField[] {
  return getSubmissionType(kind).fields.filter(
    (field) => field.required && !values[field.name]?.trim()
  );
}

function titleSubject(values: SubmissionValues): string {
  const subject =
    values.name?.trim() ||
    values.modelName?.trim() ||
    values.message?.trim() ||
    "New submission";
  return subject.length > 80 ? `${subject.slice(0, 77)}…` : subject;
}

export function buildSubmissionTitle(
  kind: SubmissionKind,
  values: SubmissionValues
): string {
  const type = getSubmissionType(kind);
  return `[${type.titlePrefix}] ${titleSubject(values)}`;
}

export function buildSubmissionBody(
  kind: SubmissionKind,
  values: SubmissionValues
): string {
  const type = getSubmissionType(kind);
  const payload: Record<string, string> = { kind };
  const lines: string[] = [
    "### goha submission",
    "",
    "<!-- The JSON block is used by the maintainers to index this entry. -->",
    "",
  ];

  for (const field of type.fields) {
    const value = values[field.name]?.trim();
    if (!value) continue;
    payload[field.name] = value;
    lines.push(
      `- **${field.label.replace(/\?$/, "")}:** ${value.replace(/\n/g, "\n  ")}`
    );
  }

  lines.push(
    "",
    "```json",
    JSON.stringify(payload, null, 2),
    "```",
    "",
    "_Submitted from the goha contribute page._"
  );

  return lines.join("\n");
}

export function buildSubmissionIssueUrl(
  kind: SubmissionKind,
  values: SubmissionValues
): string {
  const type = getSubmissionType(kind);
  const params = new URLSearchParams({
    title: buildSubmissionTitle(kind, values),
    body: buildSubmissionBody(kind, values),
    labels: type.issueLabel,
  });

  return `${EXTERNAL_LINKS.GITHUB_REPO}/issues/new?${params.toString()}`;
}
