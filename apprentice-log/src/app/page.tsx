"use client";

import { useState } from "react";
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
import { Mic, PenLine, RotateCcw, Save, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEntries } from "@/hooks";
import type { LogbookEntry } from "@/types";

type AppState = "idle" | "processing" | "result" | "saved";
type EntryMode = "voice" | "manual";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<AppState>("idle");
  const [entryMode, setEntryMode] = useState<EntryMode>("voice");
  const [entry, setEntry] = useState<LogbookEntry | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [isManualProcessing, setIsManualProcessing] = useState(false);
  const { addEntry } = useEntries(user?.id);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm />;
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setState("processing");

    try {
      // Step 1: Transcribe the audio
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json().catch(() => ({}));
        console.error("Transcription failed:", transcribeResponse.status, errorData);
        throw new Error(errorData.error || `Transcription failed (${transcribeResponse.status})`);
      }

      const { text } = await transcribeResponse.json();
      setTranscript(text);

      // Step 2: Format the entry
      const formatResponse = await fetch("/api/format-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
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
      setState("result");
      toast.success("Entry created!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      console.error("Recording processing error:", error);
      toast.error(message);
      setState("idle");
    }
  };

  const handleSave = async () => {
    if (entry) {
      const saved = await addEntry(entry);
      if (saved) {
        setState("saved");
        toast.success("Entry saved to cloud!");
      } else {
        toast.error("Failed to save entry");
      }
    }
  };

  const handleManualSubmit = async (entryData: Omit<LogbookEntry, "id" | "createdAt">) => {
    setIsManualProcessing(true);
    try {
      const saved = await addEntry(entryData);
      if (saved) {
        setState("saved");
        toast.success("Entry saved!");
      } else {
        toast.error("Failed to save entry");
      }
    } finally {
      setIsManualProcessing(false);
    }
  };

  const handleReset = () => {
    setState("idle");
    setEntry(null);
    setTranscript("");
  };

  return (
    <AppShell>
      <div className="px-4 py-4 max-w-lg mx-auto">
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
                <CardContent className="flex flex-col items-center py-16">
                  <VoiceRecorder
                    onRecordingComplete={handleRecordingComplete}
                    isProcessing={true}
                  />
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

              {/* Transcript */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
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
                transition={{ delay: 0.2 }}
                className="flex gap-3 pt-2"
              >
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
              </motion.div>
            </motion.div>
          )}

          {/* Saved State - Confirmation */}
          {state === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <Card className="w-full border-gray-200 shadow-lg">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative mb-6"
                  >
                    <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-xl shadow-green-500/30">
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Entry Saved!</h2>
                  <p className="text-muted-foreground mb-8 max-w-xs">
                    Your logbook entry has been saved and synced to the cloud.
                  </p>
                  <Button
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                    onClick={handleReset}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Record Another Entry
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
