const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let cachedGoogleToken: string | null = null;

export function setGoogleAccessToken(token: string | null) {
  cachedGoogleToken = token;
}

export async function fetchGoogleAccessToken(): Promise<string | null> {
  if (cachedGoogleToken) return cachedGoogleToken;
  try {
    console.log("[fetchGoogleAccessToken] Calling /api/auth/get-access-token...", API_URL);
    const res = await fetch(`${API_URL}/api/auth/get-access-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId: "google" }),
    });
    console.log("[fetchGoogleAccessToken] Response status:", res.status);
    if (!res.ok) {
      const errText = await res.text().catch(() => "unknown");
      console.log("[fetchGoogleAccessToken] Server error:", res.status, errText);
      return null;
    }
    const data = await res.json();
    console.log("[fetchGoogleAccessToken] Response keys:", Object.keys(data));
    const token = data?.accessToken;
    if (typeof token === "string" && token.length > 0) {
      cachedGoogleToken = token;
      console.log("[fetchGoogleAccessToken] Got token, length:", token.length);
      return cachedGoogleToken;
    }
    console.log("[fetchGoogleAccessToken] No accessToken in response:", data);
  } catch (e) {
    console.log("[fetchGoogleAccessToken] Failed:", e);
  }
  return null;
}

export function getGoogleAccessToken(): string | null {
  return cachedGoogleToken;
}

export function getSpreadsheetId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crm_spreadsheet_id");
}

function notifyStorageChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("local-storage-change"));
  }
}

export function setSpreadsheetId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem("crm_spreadsheet_id", id);
  } else {
    localStorage.removeItem("crm_spreadsheet_id");
    localStorage.removeItem("crm_spreadsheet_name");
  }
  notifyStorageChange();
}

export function getSpreadsheetName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crm_spreadsheet_name");
}

export function setSpreadsheetName(name: string | null) {
  if (typeof window === "undefined") return;
  if (name) {
    localStorage.setItem("crm_spreadsheet_name", name);
  } else {
    localStorage.removeItem("crm_spreadsheet_name");
  }
  notifyStorageChange();
}

export function getLastSpreadsheetId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crm_last_spreadsheet_id");
}

export function setLastSpreadsheetId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem("crm_last_spreadsheet_id", id);
  } else {
    localStorage.removeItem("crm_last_spreadsheet_id");
  }
}

export function getLastSpreadsheetName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crm_last_spreadsheet_name");
}

export function setLastSpreadsheetName(name: string | null) {
  if (typeof window === "undefined") return;
  if (name) {
    localStorage.setItem("crm_last_spreadsheet_name", name);
  } else {
    localStorage.removeItem("crm_last_spreadsheet_name");
  }
}

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const spreadsheetId = getSpreadsheetId();
  let googleToken = getGoogleAccessToken();
  if (!googleToken) {
    googleToken = await fetchGoogleAccessToken();
  }

  console.log("[fetcher] Request:", url, "hasToken:", !!googleToken, "hasSheetId:", !!spreadsheetId);

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(spreadsheetId ? { "X-Spreadsheet-Id": spreadsheetId } : {}),
      ...(googleToken ? { "X-Google-Access-Token": googleToken } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Request failed" }));
    console.log("[fetcher] Error:", res.status, errorData);
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export { API_URL };
