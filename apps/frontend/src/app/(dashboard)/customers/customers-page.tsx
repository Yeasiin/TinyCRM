"use client";

import { useState } from "react";
import { useCustomers } from "@/features/customers/api/use-customers";
import { CustomerFilters } from "@/features/customers/components/customer-filters";
import { DataTable } from "@/components/data-table";
import { getCustomerColumns } from "@/features/customers/components/customer-columns";
import { CustomerFormDialog } from "@/features/customers/components/customer-form-dialog";
import { DeleteCustomerDialog } from "@/features/customers/components/delete-customer-dialog";
import { Customer } from "@/features/customers/types";
import { Button } from "@/components/ui/button";

export default function CustomersPageClient() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useCustomers({
    search: search || undefined,
    page,
    limit: 20,
  });

  const columns = getCustomerColumns(
    (customer) => {
      setEditingCustomer(customer);
      setFormOpen(true);
    },
    (customer) => setDeletingCustomer(customer),
  );

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer relationships.
        </p>
      </div>

      <CustomerFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
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
            {Math.min(page * 20, data.meta.total)} of {data.meta.total} customers
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

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        customer={editingCustomer}
      />

      <DeleteCustomerDialog
        customer={deletingCustomer}
        open={!!deletingCustomer}
        onOpenChange={(open) => {
          if (!open) setDeletingCustomer(null);
        }}
      />
    </div>
  );
}
