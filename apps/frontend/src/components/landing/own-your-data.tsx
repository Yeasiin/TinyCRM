"use client";

import { FileSpreadsheet, ExternalLink, ShieldCheck, DatabaseZap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const sheetTabs = ["Leads", "Customers", "Deals", "Tasks", "Notes", "Activities"];

const sheetColumns = [
  "id",
  "userId",
  "name",
  "email",
  "phone",
  "company",
  "status",
  "source",
  "estimatedValue",
  "createdAt",
];

const sheetRows = [
  ["l_1", "u_1", "Acme Corp", "john@acme.com", "+1 555-0101", "Acme Inc", "New", "Website", "$12000", "2024-01-15"],
  ["l_2", "u_1", "Globex", "jane@globex.io", "+1 555-0102", "Globex", "Contacted", "Referral", "$8500", "2024-01-16"],
  ["l_3", "u_1", "Initech", "mike@initech.com", "+1 555-0103", "Initech", "Qualified", "LinkedIn", "$24000", "2024-01-18"],
  ["l_4", "u_1", "Hooli", "richard@hooli.com", "+1 555-0104", "Hooli", "Proposal", "Email", "$45000", "2024-01-20"],
];

export function OwnYourDataSection() {
  return (
    <section id="own-your-data" className="bg-slate-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left: Spreadsheet Visual */}
          <div className="order-2 lg:order-1">
            <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
              {/* Spreadsheet toolbar mock */}
              <div className="flex items-center gap-2 border-b bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-sm bg-green-600" />
                  <span className="text-[10px] font-medium text-[#020617]">
                    My CRM Data
                  </span>
                </div>
                <div className="h-3 w-px bg-border mx-1" />
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <FileSpreadsheet className="h-3 w-3" />
                  Google Sheets
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b bg-slate-50/50 overflow-x-auto">
                {sheetTabs.map((tab, i) => (
                  <div
                    key={tab}
                    className={`px-3 py-1.5 text-[10px] font-medium whitespace-nowrap border-r ${
                      i === 0
                        ? "bg-white text-[#020617] border-b-2 border-b-[#020617]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-green-50/50">
                      {sheetColumns.map((col) => (
                        <th
                          key={col}
                          className="border-b border-r border-slate-200 px-2 py-1.5 text-[9px] font-semibold text-[#020617] whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheetRows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="border-b border-r border-slate-100 px-2 py-1.5 text-[9px] text-muted-foreground whitespace-nowrap"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2 flex flex-col gap-6">
            <h2 className="text-3xl font-bold tracking-tight text-[#020617] sm:text-4xl">
              Your CRM data is just a{" "}
              <span className="italic">spreadsheet.</span>
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              Every lead, deal, customer, and task lives inside a Google Spreadsheet
              in your own Google Drive. You can open it anytime, export it, analyze
              it with formulas, or share it with your team.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Tinycrm is a beautiful layer on top of Google Sheets. We don't hold
              your data hostage in a proprietary database.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="gap-2 rounded-lg"
                onClick={() => {
                  toast.info("Connect your Google account to open in Sheets");
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Open in Sheets
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Stored in your Google Drive
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DatabaseZap className="h-3.5 w-3.5" />
                Full export anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
