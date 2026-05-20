"use client";

import { useDashboardStats } from "@/features/dashboard/api/use-dashboard";
import { DashboardStatsCards } from "@/features/dashboard/components/stats-cards";
import { PipelineChart } from "@/features/dashboard/components/pipeline-chart";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { RecentLeads } from "@/features/dashboard/components/recent-leads";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, error } = useDashboardStats();

  const isSpreadsheetError =
    error &&
    (error.message === "SPREADSHEET_NOT_SELECTED" ||
      error.message?.includes("SPREADSHEET_NOT_SELECTED"));

  if (isSpreadsheetError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            No Spreadsheet Selected
          </h1>
          <p className="text-muted-foreground max-w-md">
            You need to select a Google Spreadsheet to store your CRM data.
            Choose an existing sheet from your Drive or create a new one.
          </p>
        </div>
        <Button onClick={() => router.push("/select-sheet")}>
          Select Spreadsheet
        </Button>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => router.push("/select-sheet")}>
          Select Spreadsheet
        </Button>
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
