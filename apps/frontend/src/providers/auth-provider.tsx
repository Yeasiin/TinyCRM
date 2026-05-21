"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  fetcher,
  fetchGoogleAccessToken,
  getSpreadsheetId,
  getLastSpreadsheetId,
  getLastSpreadsheetName,
  setSpreadsheetId,
  setSpreadsheetName,
  setLastSpreadsheetId,
  setLastSpreadsheetName,
  API_URL,
} from "@/lib/api-client";


interface SessionData {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface AuthContextType {
  session: SessionData | null | undefined;
  isPending: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const restoredRef = useRef(false);

  const { data: session, isPending } = useQuery<SessionData | null>({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
  });

  // Prefetch Google access token when session is available
  useEffect(() => {
    if (session?.user) {
      fetchGoogleAccessToken().catch(() => {});
    }
  }, [session?.user]);

  // Auto-restore last spreadsheet on login
  const restoreMutation = useMutation({
    mutationFn: async (spreadsheetId: string) => {
      console.log("[restoreMutation] Restoring sheet:", spreadsheetId);
      // Use fetcher so X-Google-Access-Token is attached automatically
      return fetcher<{ success: boolean; sheet: { id: string; name: string } }>(
        `${API_URL}/api/crm/sheets/select`,
        {
          method: "POST",
          body: JSON.stringify({ spreadsheetId }),
        },
      );
    },
    onSuccess: (data) => {
      console.log("[restoreMutation] Success, sheet:", data.sheet.name);
      setSpreadsheetId(data.sheet.id);
      setSpreadsheetName(data.sheet.name);
      restoredRef.current = true;
      // Reload to ensure all queries fetch fresh with the new spreadsheet ID
      window.location.reload();
    },
    onError: (error) => {
      console.error("[restoreMutation] Failed:", error);
      setLastSpreadsheetId(null);
      setLastSpreadsheetName(null);
      restoredRef.current = true;
    },
  });

  useEffect(() => {
    if (restoredRef.current) return;
    if (!session?.user) return;

    const currentId = getSpreadsheetId();
    if (currentId) {
      console.log("[restoreEffect] Current sheet already set:", currentId);
      restoredRef.current = true;
      return;
    }

    const lastId = getLastSpreadsheetId();
    if (!lastId) {
      console.log("[restoreEffect] No last sheet found");
      restoredRef.current = true;
      return;
    }

    console.log("[restoreEffect] Found last sheet:", lastId);
    restoreMutation.mutate(lastId);
  }, [session?.user]);

  return (
    <AuthContext.Provider
      value={{
        session: session ?? null,
        isPending,
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
