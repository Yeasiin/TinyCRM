import { v4 as uuidv4 } from "uuid";

export function generateUUID(): string {
  return uuidv4();
}

export function rowToObject(headers: string[], row: string[]): Record<string, any> {
  const obj: Record<string, any> = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    const raw = row[i] ?? "";
    obj[key] = deserializeValue(raw);
  }
  return obj;
}

export function objectToRow(headers: string[], obj: Record<string, any>): string[] {
  return headers.map((key) => {
    const value = obj[key];
    return serializeValue(value);
  });
}

function serializeValue(value: any): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function deserializeValue(raw: string): any {
  if (raw === "") return null;
  // Try ISO date
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(raw)) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;
  }
  // Try JSON object/array
  if ((raw.startsWith("{") && raw.endsWith("}")) || (raw.startsWith("[") && raw.endsWith("]"))) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  // Try boolean
  if (raw === "true") return true;
  if (raw === "false") return false;
  // Try number — strip common currency/formatting noise first
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (/^-?\d+(\.\d+)?$/.test(cleaned) && cleaned.length < 16) {
    const n = Number(cleaned);
    if (!isNaN(n)) return n;
  }
  return raw;
}

export function filterRows(
  rows: Record<string, any>[],
  filters: Record<string, any>,
): Record<string, any>[] {
  return rows.filter((row) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;
      if (key === "search" && typeof value === "string" && value.trim()) {
        const search = value.toLowerCase();
        const searchable = Object.values(row)
          .filter((v) => typeof v === "string")
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(search)) return false;
        continue;
      }
      if (row[key] !== value) return false;
    }
    return true;
  });
}

export function sortRows(
  rows: Record<string, any>[],
  key: string,
  order: "asc" | "desc" = "desc",
): Record<string, any>[] {
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av instanceof Date && bv instanceof Date) {
      return order === "asc" ? av.getTime() - bv.getTime() : bv.getTime() - av.getTime();
    }
    if (typeof av === "number" && typeof bv === "number") {
      return order === "asc" ? av - bv : bv - av;
    }
    const as = String(av ?? "").toLowerCase();
    const bs = String(bv ?? "").toLowerCase();
    return order === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
  });
}

export function paginateRows(
  rows: Record<string, any>[],
  page: number,
  limit: number,
): { data: Record<string, any>[]; meta: { total: number; page: number; limit: number; totalPages: number } } {
  const total = rows.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const data = rows.slice(offset, offset + limit);
  return { data, meta: { total, page, limit, totalPages } };
}
