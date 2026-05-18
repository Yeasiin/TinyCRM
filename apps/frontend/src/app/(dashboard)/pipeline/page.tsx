import type { Metadata } from "next";
import PipelinePageClient from "./pipeline-page";

export const metadata: Metadata = {
  title: "Pipeline",
};

export default function PipelinePage() {
  return <PipelinePageClient />;
}
