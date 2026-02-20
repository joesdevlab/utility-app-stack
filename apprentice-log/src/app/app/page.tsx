"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "@/components/voice-recorder";
import { ManualEntryForm } from "@/components/manual-entry-form";
import { LogbookEntryCard } from "@/components/logbook-entry-card";
import { AuthForm } from "@/components/auth-form";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, PenLine, RotateCcw, Save, CheckCircle2, Loader2, Camera, X, Clock, History, Sparkles, CloudOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useEntries } from "@/hooks";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import type { LogbookEntry } from "@/types";
import { PhotoUpload } from "@/components/photo-upload";
import { PendingInvitations } from "@/components/pending-invitations";
import { LogoSpinner } from "@/components/animated-logo";
import { ProcessingStepper, type ProcessingPhase } from "@/components/processing-stepper";
import { PendingEntriesBanner } from "@/components/pending-entries-banner";

type AppState = "idle" | "processing" | "result" | "saved";
type EntryMode = "voice" | "manual";

export default function Home() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [state, setState] = useState<AppState>("idle");
  const [entryMode, setEntryMode] = useState<EntryMode>("voice");
  const [entry, setEntry] = useState<LogbookEntry | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [isManualProcessing, setIsManualProcessing] = useState(false);
  const [voiceEntryPhotos, setVoiceEntryPhotos] = useState<string[]>([]);
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>("idle");
  const { addEntry } = useEntries(user?.id);

  // Wrapper function that returns the entry or throws
  const submitEntryToServer = useCallback(
    async (entryData: Omit<LogbookEntry, "id" | "createdAt">): Promise<LogbookEntry> => {
      const saved = await addEntry(entryData);
      if (!saved) {
        throw new Error("Failed to save entry to server");
      }
      return saved;
    },
    [addEntry]
  );

  // Offline sync hook
  const {
    isOnline,
    pendingCount,
    pendingEntries,
    isSyncing,
    saveOffline,
    syncAll,
    removePending,
    retryEntry,
  } = useOfflineSync({
    submitEntry: submitEntryToServer,
    onSyncSuccess: (syncedEntry) => {
      toast.success(`Entry synced: ${syncedEntry.tasks[0]?.description?.slice(0, 30) || "Untitled"}...`);
    },
    onSyncError: (error, pendingEntry) => {
      toast.error(`Failed to sync entry: ${error}`);
    },
  });

  // Verify server-side auth on mount
  useEffect(() => {
    if (user) {
      fetch("/api/health/auth", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (!data.authenticated) {
            console.error("Server auth mismatch:", data);
            toast.error("Session expired. Please sign in again.", { duration: 5000 });
            signOut();
          }
        })
        .catch(err => console.error("Auth check failed:", err));
    }
  }, [user, signOut]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50/30 to-background">
        <LogoSpinner size="lg" />
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm />;
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setState("processing");
    setProcessingPhase("transcribing");

    try {
      // Step 1: Transcribe the audio
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json().catch(() => ({}));
        console.error("Transcription failed:", transcribeResponse.status, errorData);
        throw new Error(errorData.error || `Transcription failed (${transcribeResponse.status})`);
      }

      const { text } = await transcribeResponse.json();
      setTranscript(text);

      // Step 2: Format the entry
      setProcessingPhase("formatting");
      const formatResponse = await fetch("/api/format-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
        credentials: "include",
      });

      if (!formatResponse.ok) {
        const errorData = await formatResponse.json().catch(() => ({}));
        console.error("Format failed:", formatResponse.status, errorData);
        throw new Error(errorData.error || `Failed to format entry (${formatResponse.status})`);
      }

      const logbookEntry = await formatResponse.json();

      // Validate required fields
      if (!logbookEntry.tasks || !Array.isArray(logbookEntry.tasks)) {
        console.error("Invalid response format:", logbookEntry);
        throw new Error("Invalid entry format received from AI");
      }

      // Ensure formattedEntry has a value
      if (!logbookEntry.formattedEntry) {
        logbookEntry.formattedEntry = "";
      }

      logbookEntry.rawTranscript = text;
      setEntry(logbookEntry);
      setProcessingPhase("complete");
      setState("result");
      toast.success("Entry created!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      console.error("Recording processing error:", error);
      setProcessingPhase("error");

      // Show more detailed error for debugging
      if (message.includes("401") || message.includes("Unauthorized")) {
        toast.error("Authentication error. Please sign out and sign in again.", {
          duration: 5000,
        });
      } else if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
        toast.error("Network error. Check your internet connection.", {
          duration: 5000,
        });
      } else {
        toast.error(message, { duration: 5000 });
      }
      setState("idle");
      setProcessingPhase("idle");
    }
  };

  const handleSave = async () => {
    if (entry) {
      // Include photos with the entry
      const entryWithPhotos = {
        ...entry,
        photos: voiceEntryPhotos.length > 0 ? voiceEntryPhotos : undefined,
      };

      // If offline, save locally
      if (!isOnline) {
        try {
          await saveOffline(entryWithPhotos);
          setState("saved");
          setVoiceEntryPhotos([]);
          toast.success("Entry saved offline - will sync when you're back online", {
            icon: <CloudOff className="h-4 w-4" />,
          });
        } catch {
          toast.error("Failed to save entry offline");
        }
        return;
      }

      // Online - try to save directly
      const saved = await addEntry(entryWithPhotos);
      if (saved) {
        setState("saved");
        setVoiceEntryPhotos([]);
        toast.success("Entry saved to cloud!");
      } else {
        // Failed to save online - save offline as fallback
        try {
          await saveOffline(entryWithPhotos);
          setState("saved");
          setVoiceEntryPhotos([]);
          toast.info("Entry saved offline - will retry sync automatically", {
            icon: <CloudOff className="h-4 w-4" />,
          });
        } catch {
          toast.error("Failed to save entry");
        }
      }
    }
  };

  const handleManualSubmit = async (entryData: Omit<LogbookEntry, "id" | "createdAt">) => {
    setIsManualProcessing(true);
    try {
      // If offline, save locally
      if (!isOnline) {
        await saveOffline(entryData);
        setState("saved");
        toast.success("Entry saved offline - will sync when you're back online", {
          icon: <CloudOff className="h-4 w-4" />,
        });
        return;
      }

      // Online - try to save directly
      const saved = await addEntry(entryData);
      if (saved) {
        setState("saved");
        toast.success("Entry saved!");
      } else {
        // Failed to save online - save offline as fallback
        await saveOffline(entryData);
        setState("saved");
        toast.info("Entry saved offline - will retry sync automatically", {
          icon: <CloudOff className="h-4 w-4" />,
        });
      }
    } catch {
      toast.error("Failed to save entry");
    } finally {
      setIsManualProcessing(false);
    }
  };

  const handleReset = () => {
    setState("idle");
    setEntry(null);
    setTranscript("");
    setVoiceEntryPhotos([]);
    setProcessingPhase("idle");
  };

  return (
    <AppShell>
      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Show pending employer invitations */}
        <PendingInvitations />

        {/* Pending offline entries banner */}
        {pendingCount > 0 && (
          <div className="mb-4">
            <PendingEntriesBanner
              pendingCount={pendingCount}
              pendingEntries={pendingEntries}
              isSyncing={isSyncing}
              isOnline={isOnline}
              onSyncAll={syncAll}
              onRetryEntry={retryEntry}
              onRemoveEntry={removePending}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Idle State - Ready to Record or Manual Entry */}
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center"
            >
              {/* Mode Toggle */}
              <Tabs
                value={entryMode}
                onValueChange={(v) => setEntryMode(v as EntryMode)}
                className="w-full mb-4"
              >
                <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-gray-100/80 rounded-xl">
                  <TabsTrigger
                    value="voice"
                    className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-orange-600 font-medium"
                  >
                    <Mic className="h-4 w-4" />
                    Voice
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-orange-600 font-medium"
                  >
                    <PenLine className="h-4 w-4" />
                    Manual
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {entryMode === "voice" ? (
                <Card className="w-full border-gray-200 shadow-lg">
                  <CardContent className="flex flex-col items-center py-10 px-6">
                    <VoiceRecorder
                      onRecordingComplete={handleRecordingComplete}
                      isProcessing={false}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-8 text-center w-full"
                    >
                      <p className="text-sm font-semibold text-gray-500 mb-3">
                        Example of what to say:
                      </p>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          "Did framing all day, about 6 hours. Used the nail gun and circular saw.
                          Helped with roofing for 2 hours. Wore my hard hat and safety glasses."
                        </p>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              ) : (
                <ManualEntryForm
                  onSubmit={handleManualSubmit}
                  isProcessing={isManualProcessing}
                />
              )}
            </motion.div>
          )}

          {/* Processing State */}
          {state === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center"
            >
              <Card className="w-full border-gray-200 shadow-lg">
                <CardContent className="flex flex-col items-center py-12 px-6 gap-8">
                  <LogoSpinner size="lg" />
                  <ProcessingStepper currentPhase={processingPhase} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Result State - Show Entry */}
          {state === "result" && entry && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Success header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-2"
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="h-4 w-4" />
                  Entry created from your voice
                </span>
              </motion.div>

              <LogbookEntryCard entry={entry} />

              {/* Add Photos */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-gray-200">
                  <CardContent className="py-4 px-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Camera className="h-4 w-4 text-orange-500" />
                      <p className="text-sm font-semibold text-gray-700">Add Photos (optional)</p>
                    </div>
                    <PhotoUpload
                      photos={voiceEntryPhotos}
                      onPhotosChange={setVoiceEntryPhotos}
                      maxPhotos={5}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Transcript */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="border-gray-200">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Mic className="h-3.5 w-3.5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">What you said:</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          "{transcript}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3 pt-2"
              >
                {/* Primary actions: Redo and Save */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Redo
                  </Button>
                  <Button
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Entry
                  </Button>
                </div>
                {/* Discard option */}
                <Button
                  variant="ghost"
                  className="w-full h-10 text-gray-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4 mr-2" />
                  Discard Entry
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Saved State - Enhanced Confirmation */}
          {state === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <Card className="w-full border-gray-200 shadow-lg overflow-hidden">
                {/* Success Banner */}
                <div className={`px-6 py-4 ${
                  pendingCount > 0
                    ? "bg-gradient-to-r from-amber-500 to-orange-500"
                    : "bg-gradient-to-r from-green-500 to-emerald-500"
                }`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      {pendingCount > 0 ? (
                        <CloudOff className="h-7 w-7 text-white" />
                      ) : (
                        <CheckCircle2 className="h-7 w-7 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-white">Entry Saved!</h2>
                      <p className="text-sm text-white/80">
                        {pendingCount > 0 ? "Saved offline - will sync later" : "Synced to cloud"}
                      </p>
                    </div>
                  </motion.div>
                </div>

                <CardContent className="py-6 px-6 space-y-5">
                  {/* Entry Summary */}
                  {entry && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Just Logged</span>
                        <div className="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3 text-orange-600" />
                          <span className="text-xs font-bold text-orange-600">{entry.totalHours}h</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {entry.tasks[0]?.description || "Entry saved successfully"}
                      </p>
                      {entry.tasks.length > 1 && (
                        <p className="text-xs text-gray-500 mt-1">+{entry.tasks.length - 1} more tasks</p>
                      )}
                    </motion.div>
                  )}

                  {/* Motivational Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Great work!</span> Every entry brings you closer to completing your apprenticeship.
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <Button
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                      onClick={handleReset}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Record Another Entry
                    </Button>
                    <Link href="/app/history" className="block">
                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-50 hover:border-orange-200"
                      >
                        <History className="h-4 w-4 mr-2" />
                        View All Entries
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
