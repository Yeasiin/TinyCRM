import { Customer } from "@/features/customers/types";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, UserCheck } from "lucide-react";
import { format } from "date-fns";

export function getCustomerColumns(
  onEdit: (customer: Customer) => void,
  onDelete: (customer: Customer) => void,
  onConvert?: (customer: Customer) => void,
): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
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
      accessorKey: "industry",
      header: "Industry",
      cell: ({ row }) => row.getValue("industry") || "—",
    },
    {
      accessorKey: "lead",
      header: "Source",
      cell: ({ row }) => {
        const lead = row.original.lead;
        if (!lead) return <span className="text-muted-foreground">Direct</span>;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Lead
            </Badge>
            <span className="text-sm">{lead.name}</span>
          </div>
        );
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
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(customer)}
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
