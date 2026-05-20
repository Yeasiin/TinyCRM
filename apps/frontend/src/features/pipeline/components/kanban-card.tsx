"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, DollarSign, User } from "lucide-react";
import type { PipelineDeal } from "@/features/pipeline/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface KanbanCardProps {
  deal: PipelineDeal;
  isOverlay?: boolean;
}

export function KanbanCard({ deal, isOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: "deal", deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const contact = deal.lead || deal.customer;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
        isOverlay ? "rotate-2 scale-105 shadow-lg cursor-grabbing" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium leading-tight">{deal.title}</h4>
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2 space-y-2">
        {contact && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{contact.name}</span>
            {contact.company && (
              <span className="truncate">· {contact.company}</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          {deal.value ? (
            <div className="flex items-center gap-1 text-xs font-medium">
              <DollarSign className="h-3 w-3 text-green-600" />
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(deal.value / 100)}
            </div>
          ) : (
            <div />
          )}

        </div>
      </CardContent>
    </Card>
  );
}
