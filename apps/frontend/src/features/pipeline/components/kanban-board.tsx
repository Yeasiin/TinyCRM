"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { usePipeline, useUpdateDealStage } from "@/features/pipeline/api/use-pipeline";
import type { PipelineColumn, PipelineDeal, DealStage } from "@/features/pipeline/types";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { Skeleton } from "@/components/ui/skeleton";

export function KanbanBoard() {
  const { data, isLoading } = usePipeline();
  const updateDealStage = useUpdateDealStage();
  const [columns, setColumns] = useState<PipelineColumn[]>([]);
  const [activeDeal, setActiveDeal] = useState<PipelineDeal | null>(null);
  const [activeColumn, setActiveColumn] = useState<DealStage | null>(null);

  // Sync columns from query data
  useEffect(() => {
    if (data) setColumns(data.columns);
  }, [data]);

  // Use data from query directly, but maintain local state for optimistic updates
  const boardColumns = columns.length > 0 ? columns : data?.columns ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findColumn = useCallback(
    (dealId: string) => {
      return boardColumns.find((col) =>
        col.deals.some((d) => d.id === dealId),
      );
    },
    [boardColumns],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dealId = active.id as string;
    const column = findColumn(dealId);
    const deal = column?.deals.find((d) => d.id === dealId);
    if (deal) {
      setActiveDeal(deal);
      setActiveColumn(column?.id ?? null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the columns
    const activeCol = findColumn(activeId);
    const overCol = boardColumns.find(
      (col) => col.id === overId || col.deals.some((d) => d.id === overId),
    );

    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    setColumns((prev) => {
      const newColumns = prev.map((col) => ({ ...col, deals: [...col.deals] }));
      const sourceCol = newColumns.find((c) => c.id === activeCol.id);
      const targetCol = newColumns.find((c) => c.id === overCol.id);
      if (!sourceCol || !targetCol) return prev;

      const dealIndex = sourceCol.deals.findIndex((d) => d.id === activeId);
      if (dealIndex === -1) return prev;

      const [deal] = sourceCol.deals.splice(dealIndex, 1);
      deal.stage = overCol.id;
      targetCol.deals.push(deal);

      return newColumns;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumn(activeId);
    const overCol = boardColumns.find(
      (col) => col.id === overId || col.deals.some((d) => d.id === overId),
    );

    if (!activeCol || !overCol) return;

    if (activeCol.id !== overCol.id) {
      // Update the deal stage on the server
      updateDealStage.mutate({
        id: activeId,
        data: { stage: overCol.id },
      });
    } else {
      // Reorder within the same column
      const colDeals = activeCol.deals;
      const oldIndex = colDeals.findIndex((d) => d.id === activeId);
      const newIndex = colDeals.findIndex((d) => d.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setColumns((prev) =>
          prev.map((col) => {
            if (col.id !== activeCol.id) return col;
            return {
              ...col,
              deals: arrayMove(col.deals, oldIndex, newIndex),
            };
          }),
        );
      }
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-72 shrink-0 space-y-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!boardColumns.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No deals in your pipeline yet.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {boardColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            deals={column.deals}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeDeal ? (
          <KanbanCard deal={activeDeal} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
