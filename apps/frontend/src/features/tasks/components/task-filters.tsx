"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, X } from "lucide-react";
import { TaskStatus } from "@/features/tasks/types";

const taskStatuses: TaskStatus[] = ["todo", "in_progress", "done"];

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: TaskStatus | "all";
  onStatusChange: (value: TaskStatus | "all") => void;
  onAdd: () => void;
}

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onAdd,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select
          value={status}
          onValueChange={(value: TaskStatus | "all") => onStatusChange(value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {taskStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Add Task
      </Button>
    </div>
  );
}
