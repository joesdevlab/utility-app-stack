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
        throw new Error("Failed to transcribe audio");
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
        throw new Error("Failed to format entry");
      }

      const logbookEntry = await formatResponse.json();
      logbookEntry.rawTranscript = text;
      setEntry(logbookEntry);
      setState("result");
      toast.success("Entry created!");
    } catch {
      toast.error("Something went wrong. Please try again.");
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
      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Idle State - Ready to Record or Manual Entry */}
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              {/* Mode Toggle */}
              <Tabs
                value={entryMode}
                onValueChange={(v) => setEntryMode(v as EntryMode)}
                className="w-full max-w-md mb-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="voice" className="gap-2">
                    <Mic className="h-4 w-4" />
                    Voice
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <PenLine className="h-4 w-4" />
                    Manual
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {entryMode === "voice" ? (
                <Card className="w-full max-w-md">
                  <CardContent className="flex flex-col items-center py-12 px-6">
                    <VoiceRecorder
                      onRecordingComplete={handleRecordingComplete}
                      isProcessing={false}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-10 text-center"
                    >
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        Try saying something like:
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm italic text-muted-foreground leading-relaxed">
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <Card className="w-full max-w-md">
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
              className="space-y-4 max-w-md mx-auto"
            >
              <LogbookEntryCard entry={entry} />

              {/* Transcript */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Mic className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        "{transcript}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3"
              >
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Redo
                </Button>
                <Button
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center max-w-md mx-auto"
            >
              <Card className="w-full">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 mb-4"
                  >
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </motion.div>
                  <h2 className="text-xl font-semibold mb-2">Entry Saved!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your logbook entry has been saved to the cloud.
                  </p>
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={handleReset}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Record Another Day
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
