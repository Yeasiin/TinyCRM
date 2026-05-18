"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { PipelineColumn, PipelineDeal } from "@/features/pipeline/types";
import { KanbanCard } from "./kanban-card";
import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  column: PipelineColumn;
  deals: PipelineDeal[];
}

const columnColors: Record<string, string> = {
  new: "border-t-blue-500",
  contacted: "border-t-yellow-500",
  qualified: "border-t-purple-500",
  proposal: "border-t-orange-500",
  negotiation: "border-t-indigo-500",
  won: "border-t-green-500",
  lost: "border-t-red-500",
};

export function KanbanColumn({ column, deals }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-lg border bg-card shadow-sm ${columnColors[column.id] || ""} border-t-4 transition-colors ${
        isOver ? "bg-accent/50 ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <Badge variant="secondary">{deals.length}</Badge>
      </div>
      <div className="flex flex-col gap-2 p-3 min-h-[120px]">
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <KanbanCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
