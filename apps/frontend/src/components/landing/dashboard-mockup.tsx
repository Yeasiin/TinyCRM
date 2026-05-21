"use client";

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
} from "lucide-react";

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

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-lg overflow-hidden ${className || ""}`}
    >
      {/* Mock Browser Bar */}
      <div className="flex items-center gap-1.5 border-b bg-slate-50 px-3 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <div className="ml-3 flex-1 rounded-md bg-white border px-2 py-1 text-[10px] text-muted-foreground flex items-center gap-1">
          <FileText className="h-3 w-3" />
          tinycrm.app/dashboard
        </div>
      </div>

      <div className="flex min-h-[320px]">
        {/* Sidebar */}
        <div className="hidden sm:flex w-44 flex-col border-r bg-slate-50/50 p-2 gap-0.5">
          <div className="mb-3 px-2 py-1.5">
            <span className="text-sm font-bold italic tracking-tight text-[#020617]">
              Tinycrm
            </span>
          </div>
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium ${
                item.active
                  ? "bg-[#020617] text-white"
                  : "text-muted-foreground hover:bg-slate-100"
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#020617]">Dashboard</h3>
              <p className="text-[10px] text-muted-foreground">
                Welcome back. Here's your overview.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 rounded-md border bg-white px-2 py-1 text-[10px] text-muted-foreground">
                <Search className="h-3 w-3" />
                Search...
              </div>
              <div className="rounded-md border p-1">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total Leads", value: "124", change: "+12%" },
              { label: "Pipeline Value", value: "$48.2k", change: "+8%" },
              { label: "Customers", value: "38", change: "+4%" },
              { label: "Tasks Due", value: "17", change: "-2" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border bg-white p-3"
              >
                <div className="text-[10px] text-muted-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-base font-semibold text-[#020617]">
                  {stat.value}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Leads Table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50">
              <span className="text-xs font-medium text-[#020617]">
                Recent Leads
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
                View all <ChevronRight className="h-3 w-3" />
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-slate-50/30">
                  <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="hidden sm:table-cell px-3 py-2 text-[10px] font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-3 py-2 text-[10px] font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="hidden md:table-cell px-3 py-2 text-[10px] font-medium text-muted-foreground text-right">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {sampleLeads.map((lead) => (
                  <tr key={lead.name} className="border-b last:border-b-0">
                    <td className="px-3 py-2 text-[11px] font-medium text-[#020617]">
                      {lead.name}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-2 text-[11px] text-muted-foreground">
                      {lead.email}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
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
                    <td className="hidden md:table-cell px-3 py-2 text-[11px] text-[#020617] text-right">
                      {lead.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
