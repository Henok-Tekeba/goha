"use client";

import { useEffect, useMemo, useState } from "react";
import { HiMiniCheck, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { LuCopy } from "react-icons/lu";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { copyText } from "@/shared/lib/copy-to-clipboard";
import { cn } from "@/shared/lib/utils";

import {
  buildSubmissionBody,
  buildSubmissionIssueUrl,
  getMissingFields,
  getSubmissionType,
  SUBMISSION_TYPES,
  type SubmissionKind,
  type SubmissionValues,
} from "../lib/submission";

const INITIAL_VALUES: SubmissionValues = {};

export default function ContributionForm() {
  const [kind, setKind] = useState<SubmissionKind>("model");
  const [values, setValues] = useState<SubmissionValues>(INITIAL_VALUES);
  const [copied, setCopied] = useState(false);

  /* Deep links like /contribute?type=correction open the right tab without
     making the whole page depend on useSearchParams (which would bail out of
     static prerendering). */
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("type");
    if (
      requested &&
      SUBMISSION_TYPES.some((option) => option.value === requested)
    ) {
      setKind(requested as SubmissionKind);
    }
  }, []);

  const type = getSubmissionType(kind);
  const missing = getMissingFields(kind, values);
  const isComplete = missing.length === 0;
  const issueUrl = useMemo(
    () => buildSubmissionIssueUrl(kind, values),
    [kind, values]
  );
  const preview = useMemo(
    () => buildSubmissionBody(kind, values),
    [kind, values]
  );

  const updateValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const copySubmission = async () => {
    const ok = await copyText(preview);
    if (!ok) {
      toast.error("Could not copy the submission");
      return;
    }
    setCopied(true);
    toast.success("Submission copied", {
      description: "Paste it into a GitHub issue or send it to the team.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-[22px] border border-muted-black-stroke bg-white p-5 shadow-[0_20px_70px_-50px_rgb(0_0_0/0.25)] md:p-7">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="What are you submitting?"
      >
        {SUBMISSION_TYPES.map((option) => {
          const Icon = option.icon;
          const active = option.value === kind;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setKind(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-black-stroke bg-white text-muted-foreground hover:border-black/20 hover:text-primary"
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 max-w-2xl text-muted-foreground text-sm leading-relaxed">
        {type.description}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {type.fields.map((field) => (
          <div
            key={field.name}
            className={cn(
              "flex flex-col gap-1.5",
              (field.textarea || field.full) && "sm:col-span-2"
            )}
          >
            <Label
              htmlFor={`submission-${field.name}`}
              required={field.required}
            >
              {field.label}
            </Label>
            {field.textarea ? (
              <Textarea
                id={`submission-${field.name}`}
                value={values[field.name] ?? ""}
                onChange={(event) =>
                  updateValue(field.name, event.target.value)
                }
                placeholder={field.placeholder}
                rows={field.name === "message" ? 5 : 3}
              />
            ) : (
              <Input
                id={`submission-${field.name}`}
                value={values[field.name] ?? ""}
                onChange={(event) =>
                  updateValue(field.name, event.target.value)
                }
                placeholder={field.placeholder}
                inputMode={field.inputMode}
              />
            )}
            {field.hint && (
              <p className="text-[11px] text-black/40">{field.hint}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-muted-black-stroke border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[12px] text-muted-foreground">
          {isComplete ? (
            <span>
              Opens a{" "}
              <strong className="text-primary">public GitHub issue</strong> with
              the details filled in.
            </span>
          ) : (
            <span>
              Required:{" "}
              <span className="text-primary">
                {missing.map((field) => field.label).join(", ")}
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copySubmission}
          >
            {copied ? (
              <HiMiniCheck className="size-4" />
            ) : (
              <LuCopy className="size-4" />
            )}
            {copied ? "Copied" : "Copy submission"}
          </Button>

          {isComplete ? (
            <Button asChild size="sm">
              <a href={issueUrl} target="_blank" rel="noopener noreferrer">
                {type.actionLabel}
                <HiOutlineArrowTopRightOnSquare className="size-4" />
              </a>
            </Button>
          ) : (
            <Button size="sm" disabled>
              {type.actionLabel}
              <HiOutlineArrowTopRightOnSquare className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <details className="group mt-4 rounded-[14px] border border-muted-black-stroke bg-secondary/40 px-4 py-3">
        <summary className="cursor-pointer select-none text-[12px] text-muted-foreground transition-colors hover:text-primary">
          Preview what will be posted
        </summary>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] text-black/60 leading-relaxed">
          {preview}
        </pre>
      </details>
    </div>
  );
}
