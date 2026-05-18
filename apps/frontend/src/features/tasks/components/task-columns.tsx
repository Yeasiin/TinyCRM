import { Task, TaskStatus } from "@/features/tasks/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<TaskStatus, { label: string; icon: typeof Circle; color: string }> = {
  todo: { label: "To Do", icon: Circle, color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300" },
  in_progress: { label: "In Progress", icon: Clock, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  done: { label: "Done", icon: CheckCircle2, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
};

export function getTaskColumns(
  onEdit: (task: Task) => void,
  onDelete: (task: Task) => void,
  onToggleStatus: (task: Task) => void,
): ColumnDef<Task>[] {
  return [
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("title")}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as TaskStatus;
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
          <Badge className={config.color} variant="secondary">
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const dueDate = row.getValue("dueDate") as string | null;
        if (!dueDate) return <span className="text-muted-foreground">—</span>;
        const isOverdue = new Date(dueDate) < new Date() && row.original.status !== "done";
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {format(new Date(dueDate), "MMM d, yyyy")}
          </span>
        );
      },
    },
    {
      accessorKey: "related",
      header: "Related To",
      cell: ({ row }) => {
        const lead = row.original.lead;
        const customer = row.original.customer;
        if (lead) return <span className="text-sm">Lead: {lead.name}</span>;
        if (customer) return <span className="text-sm">Customer: {customer.name}</span>;
        return <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: "assignee",
      header: "Assigned To",
      cell: ({ row }) => row.original.assignee?.name || "—",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(task)}
              className={task.status === "done" ? "text-green-600" : ""}
            >
              {task.status === "done" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(task)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
