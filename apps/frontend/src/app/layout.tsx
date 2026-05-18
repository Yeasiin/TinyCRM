import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SalesCRM - Modern Customer Relationship Management",
    template: "%s | SalesCRM",
  },
  description:
    "A modern, full-stack Sales CRM built with Next.js, TypeScript, and PostgreSQL. Features lead management, pipeline tracking, customer conversion, tasks, and real-time analytics.",
  keywords: [
    "CRM",
    "Sales",
    "Lead Management",
    "Customer Relationship",
    "Pipeline",
    "SaaS",
  ],
  authors: [{ name: "SalesCRM" }],
  creator: "SalesCRM",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SalesCRM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
