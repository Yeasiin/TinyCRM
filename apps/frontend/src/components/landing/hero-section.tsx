"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck, DatabaseZap, FileSpreadsheet, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { DashboardMockup } from "./dashboard-mockup";

export function HeroSection() {
  const { isAuthenticated } = useAuth();
  const loginMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
      });
      if (result.error) {
        throw new Error(result.error.message || "Sign in failed");
      }
      return result.data;
    },
    onError: (error) => {
      toast.error("Sign in failed", { description: error.message });
    },
  });

  const handleSignIn = () => loginMutation.mutate();

  const scrollToDemo = () => {
    const el = document.querySelector("#dashboard");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #020617 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 w-fit">
              <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Spreadsheet-powered CRM
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-[#020617] sm:text-5xl lg:text-6xl">
              Your CRM,{" "}
              <span className="italic">powered by Google Sheets.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Manage leads, deals, customers, and tasks with a clean modern CRM
              while your data stays safely inside your own Google Drive.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  asChild
                  className="gap-2 rounded-lg bg-[#020617] text-white hover:bg-[#020617]/90"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleSignIn}
                  disabled={loginMutation.isPending}
                  className="gap-2 rounded-lg bg-[#020617] text-white hover:bg-[#020617]/90"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign in with Google"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToDemo}
                className="gap-2 rounded-lg"
              >
                View Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                No database
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DatabaseZap className="h-3.5 w-3.5" />
                No lock-in
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Your data, your Drive
              </span>
            </div>
          </div>

          {/* Right: Dashboard Mockup with floating cards */}
          <div className="relative">
            <DashboardMockup />

            {/* Floating metric cards */}
            <div className="absolute -top-4 -right-4 hidden lg:block">
              <div className="rounded-lg border bg-white p-3 shadow-sm">
                <div className="text-xs text-muted-foreground">Active leads</div>
                <div className="text-lg font-semibold text-[#020617]">124</div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden lg:block">
              <div className="rounded-lg border bg-white p-3 shadow-sm">
                <div className="text-xs text-muted-foreground">Pipeline value</div>
                <div className="text-lg font-semibold text-[#020617]">$48,250</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
