import type { Metadata } from "next";
import { Suspense } from "react";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tinycrm - Modern Customer Relationship Management",
    template: "%s | Tinycrm",
  },
  description:
    "A modern, full-stack CRM built with Next.js, TypeScript, and Google Sheets. Features lead management, pipeline tracking, customer conversion, tasks, and real-time analytics.",
  keywords: [
    "CRM",
    "Sales",
    "Lead Management",
    "Customer Relationship",
    "Pipeline",
    "SaaS",
  ],
  authors: [{ name: "Tinycrm" }],
  creator: "Tinycrm",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tinycrm",
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
            <Suspense fallback={null}>
              {children}
            </Suspense>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
