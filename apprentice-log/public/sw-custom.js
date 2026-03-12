// Custom service worker additions for offline voice queue + background sync
// This file is imported by workbox-generated service worker via importScripts

const DB_NAME = "apprentice-log-offline";
const DB_VERSION = 2;
const ENTRIES_STORE = "pending-entries";
const AUDIO_STORE = "pending-audio";
const MAX_RETRY_ATTEMPTS = 5;

/**
 * Open the IndexedDB database (same schema as the client-side code).
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        const store = db.createObjectStore(ENTRIES_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        const store = db.createObjectStore(AUDIO_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function deleteFromStore(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function updateInStore(db, storeName, item) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Process a single pending audio recording:
 * 1. Transcribe the audio via /api/transcribe
 * 2. Format the transcript via /api/format-entry
 * 3. Save the formatted entry via /api/format-entry (the client will save to Supabase on next load)
 *
 * Since the SW can't directly use the Supabase client with auth, we store the
 * result as a pending text entry that the client sync hook will pick up.
 */
async function processAudioEntry(db, audioEntry) {
  // Step 1: Transcribe
  const formData = new FormData();
  formData.append("audio", audioEntry.audioBlob, "recording.webm");

  const transcribeRes = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!transcribeRes.ok) {
    throw new Error(`Transcription failed: ${transcribeRes.status}`);
  }

  const { text } = await transcribeRes.json();

  // Step 2: Format
  const formatRes = await fetch("/api/format-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript: text }),
    credentials: "include",
  });

  if (!formatRes.ok) {
    throw new Error(`Format failed: ${formatRes.status}`);
  }

  const logbookEntry = await formatRes.json();
  logbookEntry.rawTranscript = text;

  if (!logbookEntry.formattedEntry) {
    logbookEntry.formattedEntry = "";
  }

  // Step 3: Save as pending text entry for the client sync hook to pick up
  const pendingId = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const pendingEntry = {
    id: pendingId,
    entry: logbookEntry,
    createdAt: audioEntry.createdAt,
    attempts: 0,
  };

  await updateInStore(db, ENTRIES_STORE, pendingEntry);

  // Remove the audio blob
  await deleteFromStore(db, AUDIO_STORE, audioEntry.id);
}

/**
 * Sync all pending audio recordings.
 */
async function syncAudio() {
  const db = await openDB();
  const audioEntries = await getAllFromStore(db, AUDIO_STORE);

  for (const audioEntry of audioEntries) {
    if (audioEntry.attempts >= MAX_RETRY_ATTEMPTS) continue;

    try {
      audioEntry.attempts = (audioEntry.attempts || 0) + 1;
      audioEntry.lastAttempt = new Date().toISOString();
      await updateInStore(db, AUDIO_STORE, audioEntry);

      await processAudioEntry(db, audioEntry);
    } catch (error) {
      console.error("[SW] Failed to process audio:", error);
      audioEntry.error = error.message || "Unknown error";
      await updateInStore(db, AUDIO_STORE, audioEntry);
    }
  }
}

// Listen for Background Sync events
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-audio") {
    event.waitUntil(syncAudio());
  }
  // sync-entries is handled by the client-side hook (needs Supabase auth)
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SYNC_AUDIO") {
    syncAudio().catch((err) => console.error("[SW] Manual audio sync failed:", err));
  }
});
