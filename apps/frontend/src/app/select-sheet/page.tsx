"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import {
  fetcher,
  API_URL,
  setSpreadsheetId,
  setSpreadsheetName,
  setLastSpreadsheetId,
  setLastSpreadsheetName,
} from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Sheet {
  id: string;
  name: string;
  createdTime?: string;
}

export default function SelectSheetPage() {
  const router = useRouter();
  const { isAuthenticated, isPending: authPending } = useAuth();
  const [newSheetTitle, setNewSheetTitle] = useState("My CRM Data");

  useEffect(() => {
    if (!authPending && !isAuthenticated) {
      router.push("/login");
    }
  }, [authPending, isAuthenticated, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.sheets.all,
    queryFn: () => fetcher<{ sheets: Sheet[] }>(`${API_URL}/api/crm/sheets`),
    enabled: isAuthenticated,
    retry: 1,
  });

  const selectMutation = useMutation({
    mutationFn: (spreadsheetId: string) =>
      fetcher<{ success: boolean; sheet: Sheet }>(`${API_URL}/api/crm/sheets/select`, {
        method: "POST",
        body: JSON.stringify({ spreadsheetId }),
      }),
    onSuccess: (data, spreadsheetId) => {
      setSpreadsheetId(spreadsheetId);
      setSpreadsheetName(data.sheet.name);
      setLastSpreadsheetId(spreadsheetId);
      setLastSpreadsheetName(data.sheet.name);
      toast.success("Spreadsheet selected");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Failed to select spreadsheet", {
        description: error.message,
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      fetcher<{ id: string; name: string }>(`${API_URL}/api/crm/sheets/create`, {
        method: "POST",
        body: JSON.stringify({ title: newSheetTitle || undefined }),
      }),
    onSuccess: (data) => {
      setSpreadsheetId(data.id);
      setSpreadsheetName(data.name);
      setLastSpreadsheetId(data.id);
      setLastSpreadsheetName(data.name);
      toast.success("New spreadsheet created");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Failed to create spreadsheet", {
        description: error.message,
      });
    },
  });

  if (authPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Select a Spreadsheet</h1>
          <p className="text-muted-foreground">
            Choose an existing Google Sheet or create a new one for your CRM data.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold">Failed to load spreadsheets</p>
            <p>{error.message}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Spreadsheets</CardTitle>
            <CardDescription>
              Select a spreadsheet from your Google Drive to use as your CRM database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : data?.sheets && data.sheets.length > 0 ? (
              data.sheets.map((sheet) => (
                <button
                  key={sheet.id}
                  onClick={() => selectMutation.mutate(sheet.id)}
                  disabled={selectMutation.isPending}
                  className="w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-green-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div>
                      <p className="font-medium text-sm">{sheet.name}</p>
                      {sheet.createdTime && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(sheet.createdTime).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectMutation.variables === sheet.id && selectMutation.isPending ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span className="text-xs text-muted-foreground">Select</span>
                  )}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {error ? "Could not load spreadsheets." : "No spreadsheets found in your Google Drive."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create New</CardTitle>
            <CardDescription>
              Create a new spreadsheet with all CRM tabs pre-configured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={newSheetTitle}
              onChange={(e) => setNewSheetTitle(e.target.value)}
              placeholder="Spreadsheet name"
            />
            <Button
              className="w-full"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !newSheetTitle.trim()}
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create New Spreadsheet
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
