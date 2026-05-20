"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
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
      const res = await fetch(`${API_URL}/api/crm/sheets/select`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to restore sheet" }));
        throw new Error(err.error || "Failed to restore sheet");
      }
      return res.json() as Promise<{ success: boolean; sheet: { id: string; name: string } }>;
    },
    onSuccess: (data) => {
      setSpreadsheetId(data.sheet.id);
      setSpreadsheetName(data.sheet.name);
    },
    onError: () => {
      setLastSpreadsheetId(null);
      setLastSpreadsheetName(null);
    },
  });

  useEffect(() => {
    if (restoredRef.current) return;
    if (!session?.user) return;

    const currentId = getSpreadsheetId();
    if (currentId) {
      restoredRef.current = true;
      return;
    }

    const lastId = getLastSpreadsheetId();
    const lastName = getLastSpreadsheetName();
    if (lastId) {
      restoredRef.current = true;
      restoreMutation.mutate(lastId);
    } else {
      restoredRef.current = true;
    }
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
