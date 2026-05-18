"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  DollarSign,
  CheckSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, subtitle, icon, trend = "neutral" }: StatCardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-muted-foreground",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className={`text-xs mt-1 ${trendColors[trend]}`}>{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsCardsProps {
  stats: {
    counts: {
      leads: number;
      customers: number;
      deals: number;
      tasks: number;
      openTasks: number;
    };
    won: { count: number; value: number };
    lost: { count: number; value: number };
  };
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const totalRevenue = stats.won.value / 100;
  const winRate =
    stats.won.count + stats.lost.count > 0
      ? Math.round(
          (stats.won.count / (stats.won.count + stats.lost.count)) * 100,
        )
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Leads"
        value={stats.counts.leads}
        subtitle={`${stats.counts.leads - stats.counts.customers} not yet converted`}
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Customers"
        value={stats.counts.customers}
        subtitle="Total converted"
        icon={<Building2 className="h-4 w-4" />}
        trend="up"
      />
      <StatCard
        title="Revenue Won"
        value={new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(totalRevenue)}
        subtitle={`${winRate}% win rate`}
        icon={<DollarSign className="h-4 w-4" />}
        trend="up"
      />
      <StatCard
        title="Open Tasks"
        value={stats.counts.openTasks}
        subtitle={`${stats.counts.tasks} total tasks`}
        icon={<CheckSquare className="h-4 w-4" />}
        trend={stats.counts.openTasks > 5 ? "down" : "neutral"}
      />
    </div>
  );
}
