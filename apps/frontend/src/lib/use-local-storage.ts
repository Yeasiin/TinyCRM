import { useSyncExternalStore } from "react";

function getSnapshot(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("local-storage-change", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("local-storage-change", handler);
  };
}

export function useLocalStorage(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(key),
    () => null,
  );
}
