"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Building2,
  Kanban,
  CheckSquare,
  Loader2,
} from "lucide-react";
import { fetcher, API_URL, getSpreadsheetId } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LeadsResponse } from "@/features/leads/types";
import type { CustomersResponse } from "@/features/customers/types";
import type { TasksResponse } from "@/features/tasks/types";

interface SearchDeal {
  id: string;
  title: string;
  stage: string;
  value: number | null;
}

interface DealsResponse {
  data: SearchDeal[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const hasSheet = typeof window !== "undefined" && !!getSpreadsheetId();

  const enabled = debouncedQuery.trim().length > 1 && hasSheet;

  const leadsQuery = useQuery<LeadsResponse>({
    queryKey: ["search", "leads", debouncedQuery],
    queryFn: () =>
      fetcher<LeadsResponse>(
        `${API_URL}/api/crm/leads?search=${encodeURIComponent(debouncedQuery)}&limit=5`,
      ),
    enabled,
  });

  const customersQuery = useQuery<CustomersResponse>({
    queryKey: ["search", "customers", debouncedQuery],
    queryFn: () =>
      fetcher<CustomersResponse>(
        `${API_URL}/api/crm/customers?search=${encodeURIComponent(debouncedQuery)}&limit=5`,
      ),
    enabled,
  });

  const dealsQuery = useQuery<DealsResponse>({
    queryKey: ["search", "deals", debouncedQuery],
    queryFn: () =>
      fetcher<DealsResponse>(
        `${API_URL}/api/crm/deals?search=${encodeURIComponent(debouncedQuery)}&limit=5`,
      ),
    enabled,
  });

  const tasksQuery = useQuery<TasksResponse>({
    queryKey: ["search", "tasks", debouncedQuery],
    queryFn: () =>
      fetcher<TasksResponse>(
        `${API_URL}/api/crm/tasks?search=${encodeURIComponent(debouncedQuery)}&limit=5`,
      ),
    enabled,
  });

  const isLoading =
    leadsQuery.isLoading ||
    customersQuery.isLoading ||
    dealsQuery.isLoading ||
    tasksQuery.isLoading;

  const leads = leadsQuery.data?.data ?? [];
  const customers = customersQuery.data?.data ?? [];
  const deals = dealsQuery.data?.data ?? [];
  const tasks = tasksQuery.data?.data ?? [];

  const hasResults =
    leads.length > 0 ||
    customers.length > 0 ||
    deals.length > 0 ||
    tasks.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const showDropdown = open && debouncedQuery.trim().length > 1;

  return (
    <div ref={containerRef} className="relative w-full max-w-[220px] lg:max-w-xs">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-9 h-9 bg-muted/50"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-popover p-1 shadow-md z-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : !hasResults ? (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
              No results found
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {leads.length > 0 && (
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Leads
                  </p>
                  {leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleNavigate(`/leads/${lead.id}`)}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{lead.name}</p>
                        {lead.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {lead.email}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {customers.length > 0 && (
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Customers
                  </p>
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleNavigate(`/customers`)}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{customer.name}</p>
                        {customer.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {deals.length > 0 && (
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Deals
                  </p>
                  {deals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => handleNavigate(`/pipeline`)}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <Kanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{deal.title}</p>
                        <p className="truncate text-xs text-muted-foreground capitalize">
                          {deal.stage}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {tasks.length > 0 && (
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Tasks
                  </p>
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleNavigate(`/tasks`)}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <CheckSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{task.title}</p>
                        <p className="truncate text-xs text-muted-foreground capitalize">
                          {task.status.replace("_", " ")}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
