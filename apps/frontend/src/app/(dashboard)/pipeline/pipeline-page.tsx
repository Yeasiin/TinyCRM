"use client";

import { KanbanBoard } from "@/features/pipeline/components/kanban-board";

export default function PipelinePageClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">
          Drag and drop deals to move them through your sales pipeline.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
