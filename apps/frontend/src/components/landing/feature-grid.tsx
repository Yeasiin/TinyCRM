"use client";

import {
  Users,
  Kanban,
  Building2,
  CheckSquare,
  FileText,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Lead Management",
    description:
      "Track leads with contact details, company, source, status, and estimated value.",
  },
  {
    icon: Kanban,
    title: "Visual Sales Pipeline",
    description:
      "Drag-and-drop Kanban board synced instantly with Google Sheets.",
  },
  {
    icon: Building2,
    title: "Customer Conversion",
    description:
      "Convert leads into customers with full history preserved.",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description:
      "Manage linked tasks with due dates and completion tracking.",
  },
  {
    icon: FileText,
    title: "Notes & Activity Log",
    description:
      "See every update and maintain a full activity timeline.",
  },
  {
    icon: BarChart3,
    title: "Real-time Dashboard",
    description:
      "Analytics cards, charts, activity feeds, and sales overview.",
  },
];

export function FeatureGridSection() {
  return (
    <section id="features" className="bg-slate-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-[#020617] sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            A lightweight CRM with all the essentials. No bloat, no unnecessary features.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-white p-6 transition-all hover:shadow-sm hover:border-slate-300"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border bg-slate-50 text-[#020617] transition-colors group-hover:bg-[#020617] group-hover:text-white">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#020617]">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
