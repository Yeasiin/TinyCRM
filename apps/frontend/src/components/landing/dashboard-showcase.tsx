"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  CheckSquare,
  FileText,
  BarChart3,
  Activity,
  ChevronRight,
  Search,
  Bell,
  MoreHorizontal,
  GripVertical,
} from "lucide-react";

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

const pipelineData = [
  { name: "New", value: 42 },
  { name: "Contacted", value: 28 },
  { name: "Qualified", value: 19 },
  { name: "Proposal", value: 14 },
  { name: "Won", value: 21 },
];

const revenueData = [
  { month: "Jan", value: 12000 },
  { month: "Feb", value: 18000 },
  { month: "Mar", value: 15000 },
  { month: "Apr", value: 24000 },
  { month: "May", value: 32000 },
  { month: "Jun", value: 28000 },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Leads" },
  { icon: Building2, label: "Customers" },
  { icon: Kanban, label: "Pipeline" },
  { icon: CheckSquare, label: "Tasks" },
  { icon: FileText, label: "Notes" },
  { icon: BarChart3, label: "Reports" },
  { icon: Activity, label: "Activity" },
];

const sampleLeads = [
  { name: "Acme Corp", email: "john@acme.com", status: "New", value: "$12,000" },
  { name: "Globex", email: "jane@globex.io", status: "Contacted", value: "$8,500" },
  { name: "Initech", email: "mike@initech.com", status: "Qualified", value: "$24,000" },
  { name: "Hooli", email: "richard@hooli.com", status: "Proposal", value: "$45,000" },
];

const kanbanColumns = [
  { name: "New", count: 12, color: "bg-blue-50 border-blue-200" },
  { name: "Contacted", count: 8, color: "bg-amber-50 border-amber-200" },
  { name: "Qualified", count: 5, color: "bg-emerald-50 border-emerald-200" },
  { name: "Proposal", count: 4, color: "bg-violet-50 border-violet-200" },
];

const activities = [
  { text: "Lead 'Acme Corp' created", time: "2 min ago" },
  { text: "Deal moved to Proposal", time: "15 min ago" },
  { text: "Task completed by you", time: "1 hr ago" },
  { text: "Customer 'Globex' converted", time: "3 hr ago" },
];

export function DashboardShowcaseSection() {
  const mounted = useMounted();
  return (
    <section id="dashboard" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-[#020617] sm:text-4xl">
            A dashboard that feels real
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Clean, modern, and spreadsheet-backed. Every number updates in real time.
          </p>
        </div>

        <div className="rounded-xl border bg-white shadow-xl overflow-hidden">
          {/* Mock Browser Bar */}
          <div className="flex items-center gap-1.5 border-b bg-slate-50 px-3 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <div className="ml-3 flex-1 rounded-md bg-white border px-2 py-1 text-[10px] text-muted-foreground flex items-center gap-1 max-w-xs">
              <FileText className="h-3 w-3" />
              tinycrm.app/dashboard
            </div>
          </div>

          <div className="flex min-h-[500px]">
            {/* Sidebar */}
            <div className="hidden md:flex w-52 flex-col border-r bg-slate-50/50 p-3 gap-0.5">
              <div className="mb-4 px-2 py-2">
                <span className="text-base font-bold italic tracking-tight text-[#020617]">
                  Tinycrm
                </span>
              </div>
              {sidebarItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium ${
                    item.active
                      ? "bg-[#020617] text-white"
                      : "text-muted-foreground hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-5 lg:p-6 overflow-x-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-[#020617]">
                    Dashboard
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Welcome back. Here's your overview.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs text-muted-foreground">
                    <Search className="h-3.5 w-3.5" />
                    Search...
                  </div>
                  <div className="rounded-md border p-1.5">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total Leads", value: "124", change: "+12%" },
                  { label: "Pipeline Value", value: "$48.2k", change: "+8%" },
                  { label: "Customers", value: "38", change: "+4%" },
                  { label: "Tasks Due", value: "17", change: "-2" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border bg-white p-4"
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {stat.label}
                    </div>
                    <div className="text-xl font-semibold text-[#020617]">
                      {stat.value}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        stat.change.startsWith("-")
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid gap-4 lg:grid-cols-2 mb-6">
                {/* Pipeline Chart */}
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-[#020617]">
                      Pipeline Overview
                    </h4>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-48 min-h-[192px]">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pipelineData} barSize={32}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#020617"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-[#020617]">
                      Revenue Trend
                    </h4>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-48 min-h-[192px]">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient
                            id="colorValue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#020617"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor="#020617"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `$${v / 1000}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                          }}
                          formatter={(value) =>
                            typeof value === "number"
                              ? `$${value.toLocaleString()}`
                              : value
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#020617"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Table + Activity + Kanban */}
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Leads Table */}
                <div className="lg:col-span-2 rounded-lg border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/50">
                    <span className="text-sm font-medium text-[#020617]">
                      Recent Leads
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                      View all <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-slate-50/30">
                        <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="hidden sm:table-cell px-4 py-2.5 text-xs font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="hidden md:table-cell px-4 py-2.5 text-xs font-medium text-muted-foreground text-right">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleLeads.map((lead) => (
                        <tr key={lead.name} className="border-b last:border-b-0">
                          <td className="px-4 py-3 text-sm font-medium text-[#020617]">
                            {lead.name}
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground">
                            {lead.email}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                lead.status === "New"
                                  ? "bg-blue-50 text-blue-700"
                                  : lead.status === "Contacted"
                                  ? "bg-amber-50 text-amber-700"
                                  : lead.status === "Qualified"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-violet-50 text-violet-700"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="hidden md:table-cell px-4 py-3 text-sm text-[#020617] text-right">
                            {lead.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Activity + Kanban */}
                <div className="flex flex-col gap-4">
                  {/* Activity Feed */}
                  <div className="rounded-lg border bg-white p-4">
                    <h4 className="text-sm font-medium text-[#020617] mb-3">
                      Recent Activity
                    </h4>
                    <div className="flex flex-col gap-3">
                      {activities.map((activity, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 text-xs"
                        >
                          <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                          <div>
                            <p className="text-[#020617]">{activity.text}</p>
                            <p className="text-muted-foreground mt-0.5">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kanban Preview */}
                  <div className="rounded-lg border bg-white p-4">
                    <h4 className="text-sm font-medium text-[#020617] mb-3">
                      Pipeline Preview
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {kanbanColumns.map((col) => (
                        <div
                          key={col.name}
                          className={`rounded-md border p-2 ${col.color}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-[#020617]">
                              {col.name}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {col.count}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <GripVertical className="h-3 w-3" />
                            <div className="h-1.5 flex-1 rounded-full bg-current opacity-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
