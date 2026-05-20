"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  setGoogleAccessToken,
  setSpreadsheetId,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";

export function UserButton() {
  const router = useRouter();
  const { session, isAuthenticated } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      setGoogleAccessToken(null);
      setSpreadsheetId(null);
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

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Signing out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
