"use client";

import { useState } from "react";
import { useLeads } from "@/features/leads/api/use-leads";
import { LeadFilters } from "@/features/leads/components/lead-filters";
import { DataTable } from "@/components/data-table";
import { getLeadColumns } from "@/features/leads/components/lead-columns";
import { LeadFormDialog } from "@/features/leads/components/lead-form-dialog";
import { DeleteLeadDialog } from "@/features/leads/components/delete-lead-dialog";
import { Lead, LeadStatus } from "@/features/leads/types";
import { Button } from "@/components/ui/button";

export default function LeadsPageClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const { data, isLoading } = useLeads({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page,
    limit: 20,
  });

  const columns = getLeadColumns(
    (lead) => {
      setEditingLead(lead);
      setFormOpen(true);
    },
    (lead) => setDeletingLead(lead),
  );

  const handleAdd = () => {
    setEditingLead(null);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingLead(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Manage and track your sales leads.
        </p>
      </div>

      <LeadFilters
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
        data={data?.data ?? []}
        loading={isLoading}
      />

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} -{" "}
            {Math.min(page * 20, data.meta.total)} of {data.meta.total} leads
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

      <LeadFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        lead={editingLead}
      />

      <DeleteLeadDialog
        lead={deletingLead}
        open={!!deletingLead}
        onOpenChange={(open) => {
          if (!open) setDeletingLead(null);
        }}
      />
    </div>
  );
}
