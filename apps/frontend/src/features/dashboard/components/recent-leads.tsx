"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { LeadItem } from "@/features/dashboard/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  proposal: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  negotiation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  won: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

interface RecentLeadsProps {
  leads: LeadItem[];
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Leads</CardTitle>
        <Link
          href="/leads"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No leads yet
            </p>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{lead.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {lead.company && <span>{lead.company}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    className={statusColors[lead.status] || ""}
                    variant="secondary"
                  >
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(lead.createdAt), "MMM d")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
