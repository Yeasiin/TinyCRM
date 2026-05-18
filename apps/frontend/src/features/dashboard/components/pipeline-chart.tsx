"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface PipelineChartProps {
  pipeline: Record<string, { total: number; count: number }>;
  leadsByStatus: Record<string, number>;
}

const COLORS = [
  "#3b82f6", // blue
  "#eab308", // yellow
  "#a855f7", // purple
  "#f97316", // orange
  "#6366f1", // indigo
  "#22c55e", // green
  "#ef4444", // red
];

const STAGE_ORDER = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export function PipelineChart({ pipeline, leadsByStatus }: PipelineChartProps) {
  const pipelineData = STAGE_ORDER.map((stage) => ({
    name: stage.charAt(0).toUpperCase() + stage.slice(1),
    value: (pipeline[stage]?.total ?? 0) / 100,
    count: pipeline[stage]?.count ?? 0,
  }));

  const leadStatusData = STAGE_ORDER.map((stage, index) => ({
    name: stage.charAt(0).toUpperCase() + stage.slice(1),
    value: leadsByStatus[stage] ?? 0,
    color: COLORS[index],
  })).filter((d) => d.value > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Value by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    notation: "compact",
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(Number(value))
                }
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leadStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {leadStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {leadStatusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
