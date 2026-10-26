import assert from "node:assert/strict";
import { test } from "node:test";

import { z } from "zod";

import { onboardingSchema } from "@/features/auth/validations/onboarding.schema";

test("Zod 4 validates the existing form contract in jitless mode", () => {
  z.config({ jitless: true });

  const valid = onboardingSchema.safeParse({
    jobTitle: "ML engineer",
    techStacks: ["Python"],
    userCategories: ["Research"],
  });
  assert.equal(valid.success, true);

  const invalid = onboardingSchema.safeParse({
    jobTitle: "",
    techStacks: [],
    userCategories: [],
  });
  assert.equal(invalid.success, false);
  assert.ok(invalid.error.issues.some((issue) => issue.path[0] === "jobTitle"));
});
