import type { Metadata } from "next";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
