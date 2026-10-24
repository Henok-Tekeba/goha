import type { Metadata } from "next";

import StepProjectDetailsView from "@/features/projects/views/stepper-views/common/step-project-describe.view";

export const metadata: Metadata = {
  title: "Describe your project",
  description: "Describe your project on goha",
};

export default function page() {
  return <StepProjectDetailsView />;
}
