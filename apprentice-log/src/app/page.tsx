"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "@/components/voice-recorder";
import { LogbookEntryCard } from "@/components/logbook-entry-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, RotateCcw, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useEntries } from "@/hooks";
import type { LogbookEntry } from "@/types";

type AppState = "idle" | "processing" | "result" | "saved";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [entry, setEntry] = useState<LogbookEntry | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const { addEntry } = useEntries();

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
      logbookEntry.transcript = text;
      setEntry(logbookEntry);
      setState("result");
      toast.success("Entry created!");
    } catch (error) {
      console.error("Error processing recording:", error);
      toast.error("Something went wrong. Please try again.");
      setState("idle");
    }
  };

  const handleSave = () => {
    if (entry) {
      addEntry(entry);
      setState("saved");
      toast.success("Entry saved to history!");
    }
  };

  const handleReset = () => {
    setState("idle");
    setEntry(null);
    setTranscript("");
  };

  return (
    <div className="px-4 py-6">
      <AnimatePresence mode="wait">
        {/* Idle State - Ready to Record */}
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center"
          >
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
                className="flex-1 bg-orange-500 hover:bg-orange-600"
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
                  Your logbook entry has been saved to history.
                </p>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
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
  );
}
