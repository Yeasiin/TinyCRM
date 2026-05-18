"use client";

import { useDashboardStats } from "@/features/dashboard/api/use-dashboard";
import { DashboardStatsCards } from "@/features/dashboard/components/stats-cards";
import { PipelineChart } from "@/features/dashboard/components/pipeline-chart";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { RecentLeads } from "@/features/dashboard/components/recent-leads";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your sales performance and activity.
        </p>
      </div>

      {data && (
        <>
          <DashboardStatsCards stats={data} />

          <PipelineChart
            pipeline={data.pipeline}
            leadsByStatus={data.leadsByStatus}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <ActivityFeed activities={data.recentActivity} />
            <RecentLeads leads={data.recentLeads} />
          </div>
        </>
      )}
    </div>
  );
}
