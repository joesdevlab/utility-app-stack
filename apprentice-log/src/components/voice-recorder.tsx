"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  isProcessing = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);

    animationRef.current = requestAnimationFrame(monitorAudioLevel);
  }, []);

  const triggerHaptic = useCallback(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      triggerHaptic();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        console.log("Recording complete:", {
          size: audioBlob.size,
          type: audioBlob.type,
          chunks: chunksRef.current.length,
        });
        onRecordingComplete(audioBlob);

        // Cleanup
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      // Start monitoring audio levels
      monitorAudioLevel();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("Permission") || message.includes("NotAllowed")) {
        toast.error("Microphone permission denied. Please allow access in your browser settings.");
      } else if (message.includes("NotFound")) {
        toast.error("No microphone found. Please connect a microphone.");
      } else {
        toast.error(`Could not access microphone: ${message}`);
      }
    }
  }, [onRecordingComplete, monitorAudioLevel, triggerHaptic]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      triggerHaptic();
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isRecording, triggerHaptic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          {/* Animated processing rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/30 to-orange-600/30"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
          />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl shadow-orange-500/30">
            <Loader2 className="h-14 w-14 animate-spin text-white" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold text-gray-900">Processing...</p>
          <p className="text-sm text-muted-foreground">AI is transcribing your voice</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-300 ${
          isRecording
            ? "bg-red-500/30 opacity-100"
            : "bg-orange-500/20 opacity-60"
        }`} />

        {/* Pulse rings when recording */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
              {/* Audio level indicator ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-400"
                animate={{
                  scale: 1 + audioLevel * 0.35,
                  opacity: 0.6 + audioLevel * 0.4,
                }}
                transition={{ duration: 0.05 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.02 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative flex h-32 w-32 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
            isRecording
              ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40"
              : "bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/40"
          }`}
        >
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="stop"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Square className="h-12 w-12 text-white fill-white" />
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Mic className="h-14 w-14 text-white" strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-full">
              <motion.div
                className="h-3 w-3 rounded-full bg-red-500"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-2xl font-bold tabular-nums text-red-600">
                {formatTime(recordingTime)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Tap to stop recording</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-2"
          >
            <p className="text-lg font-semibold text-gray-900">Tap to record</p>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Describe your work tasks, hours, tools used, and skills learned
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
