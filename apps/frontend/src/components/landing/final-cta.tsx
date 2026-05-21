"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

export function FinalCtaSection() {
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
    <section className="bg-[#020617] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Start managing your CRM in under 60 seconds.
        </h2>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto">
          No setup. No migration. No complicated software.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Button
              size="lg"
              asChild
              className="gap-2 rounded-lg bg-white text-[#020617] hover:bg-slate-100"
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
              className="gap-2 rounded-lg bg-white text-[#020617] hover:bg-slate-100"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in with Google"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToDemo}
            className="gap-2 rounded-lg border-slate-700 text-white hover:bg-slate-800 hover:text-white"
          >
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
