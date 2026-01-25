"use client";

import type { LogbookEntry } from "@/types";

const DB_NAME = "apprentice-log-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-entries";

export interface PendingEntry {
  id: string;
  entry: Omit<LogbookEntry, "id" | "createdAt">;
  createdAt: string;
  attempts: number;
  lastAttempt?: string;
  error?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create pending entries store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });

  return dbPromise;
}

export async function savePendingEntry(
  entry: Omit<LogbookEntry, "id" | "createdAt">
): Promise<string> {
  const db = await getDB();
  const id = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const pendingEntry: PendingEntry = {
    id,
    entry,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(pendingEntry);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingEntries(): Promise<PendingEntry[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const entries = request.result as PendingEntry[];
      // Sort by createdAt ascending (oldest first)
      entries.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      resolve(entries);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingEntryCount(): Promise<number> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingEntry(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updatePendingEntry(
  id: string,
  updates: Partial<PendingEntry>
): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as PendingEntry | undefined;
      if (!existing) {
        reject(new Error("Entry not found"));
        return;
      }

      const updated = { ...existing, ...updates };
      const putRequest = store.put(updated);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function clearAllPendingEntries(): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
