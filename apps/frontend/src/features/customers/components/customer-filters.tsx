"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, X } from "lucide-react";

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
}

export function CustomerFilters({
  search,
  onSearchChange,
  onAdd,
}: CustomerFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
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
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Add Customer
      </Button>
    </div>
  );
}
