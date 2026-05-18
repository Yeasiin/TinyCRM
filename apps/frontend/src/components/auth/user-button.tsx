"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function UserButton() {
  const router = useRouter();
  const { session, isAuthenticated } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      toast.success("Signed out", {
        description: "You have been successfully signed out.",
      });
      router.push("/login");
      router.refresh();
    },
    onError: (error) => {
      toast.error("Sign out failed", {
        description: error.message,
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={() => router.push("/login")}>
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">
        {session?.user?.name || session?.user?.email}
      </span>
      <Button
        variant="outline"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
