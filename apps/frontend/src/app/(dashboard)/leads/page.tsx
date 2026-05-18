import type { Metadata } from "next";
import LeadsPageClient from "./leads-page";

export const metadata: Metadata = {
  title: "Leads",
};

export default function LeadsPage() {
  return <LeadsPageClient />;
}
