"use client";

import { useState } from "react";
import { useTasks, useUpdateTask } from "@/features/tasks/api/use-tasks";
import { TaskFilters } from "@/features/tasks/components/task-filters";
import { DataTable } from "@/components/data-table";
import { getTaskColumns } from "@/features/tasks/components/task-columns";
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog";
import { DeleteTaskDialog } from "@/features/tasks/components/delete-task-dialog";
import { Task, TaskStatus } from "@/features/tasks/types";
import { Button } from "@/components/ui/button";

export default function TasksPageClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const { data, isLoading } = useTasks({
    status: status === "all" ? undefined : status,
    page,
    limit: 20,
  });

  const updateTask = useUpdateTask();

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    updateTask.mutate({ id: task.id, data: { status: newStatus } });
  };

  const columns = getTaskColumns(
    (task) => {
      setEditingTask(task);
      setFormOpen(true);
    },
    (task) => setDeletingTask(task),
    handleToggleStatus,
  );

  const handleAdd = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingTask(null);
  };

  const filteredData = search
    ? data?.data.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Manage your tasks and follow-ups.
        </p>
      </div>

      <TaskFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onAdd={handleAdd}
      />

      <DataTable
        columns={columns}
        data={filteredData ?? []}
        loading={isLoading}
      />

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} -{" "}
            {Math.min(page * 20, data.meta.total)} of {data.meta.total} tasks
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(data.meta.totalPages, p + 1))
              }
              disabled={page === data.meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        task={editingTask}
      />

      <DeleteTaskDialog
        task={deletingTask}
        open={!!deletingTask}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null);
        }}
      />
    </div>
  );
}
