"use client";

import { FileSpreadsheet, Cloud, Zap, Lock, Layers } from "lucide-react";

const trustItems = [
  {
    icon: Layers,
    label: "Spreadsheet-powered",
  },
  {
    icon: Cloud,
    label: "Google Drive based",
  },
  {
    icon: Zap,
    label: "Zero setup",
  },
  {
    icon: Lock,
    label: "Own your data",
  },
  {
    icon: FileSpreadsheet,
    label: "Works with Google Sheets",
  },
];

export function TrustBar() {
  return (
    <section className="border-y bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <item.icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
