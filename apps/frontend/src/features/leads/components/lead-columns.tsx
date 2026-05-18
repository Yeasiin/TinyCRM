import { Lead, LeadStatus } from "@/features/leads/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  proposal: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  negotiation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  won: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function getLeadColumns(
  onEdit: (lead: Lead) => void,
  onDelete: (lead: Lead) => void,
): ColumnDef<Lead>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <Link
            href={`/leads/${row.original.id}`}
            className="font-medium hover:text-primary transition-colors"
          >
            {row.getValue("name")}
          </Link>
          {row.original.email && (
            <div className="text-sm text-muted-foreground">
              {row.original.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => row.getValue("company") || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as LeadStatus;
        return (
          <Badge className={statusColors[status]} variant="secondary">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => row.getValue("source") || "—",
    },
    {
      accessorKey: "estimatedValue",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("estimatedValue") as number | null;
        if (!value) return "—";
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value / 100);
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        format(new Date(row.getValue("createdAt")), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/leads/${lead.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(lead)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(lead)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
