"use client";

import { LogIn, FileSpreadsheet, LayoutDashboard } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: LogIn,
    title: "Sign in with Google",
    description:
      "One-click authentication using your Google account. No passwords, no forms.",
  },
  {
    number: "02",
    icon: FileSpreadsheet,
    title: "Select Spreadsheet",
    description:
      "Choose an existing spreadsheet or let Tinycrm generate one automatically.",
  },
  {
    number: "03",
    icon: LayoutDashboard,
    title: "Manage Everything",
    description:
      "Track leads, tasks, deals, customers, and notes from a clean dashboard.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-[#020617] sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            From sign-in to your first lead in under 60 seconds. No setup required.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col">
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
              )}

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-slate-50 text-[#020617]">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Step {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-[#020617]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
