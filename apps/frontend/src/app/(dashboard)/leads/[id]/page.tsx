"use client";

import { useParams } from "next/navigation";
import { useLead } from "@/features/leads/api/use-leads";
import { NotesTimeline } from "@/features/notes/components/notes-timeline";
import { ActivityTimeline } from "@/features/activities/components/activity-timeline";
import { AttachmentList } from "@/features/attachments/components/attachment-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Phone, Building2, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  proposal: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  negotiation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  won: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;
  const { data: lead, isLoading } = useLead(leadId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Lead not found</h2>
        <Link href="/leads" className="text-primary hover:underline mt-2 inline-block">
          Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/leads"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={statusColors[lead.status]} variant="secondary">
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>
            {lead.source && (
              <span className="text-sm text-muted-foreground">
                via {lead.source}
              </span>
            )}
          </div>
        </div>
        {lead.estimatedValue && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Estimated Value</div>
            <div className="text-xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(lead.estimatedValue / 100)}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.phone}</span>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.company}</span>
                </div>
              )}
              {lead.assignee && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Assigned to {lead.assignee.name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created {format(new Date(lead.createdAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesTimeline leadId={leadId} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <AttachmentList leadId={leadId} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline leadId={leadId} />
        </CardContent>
      </Card>
    </div>
  );
}
