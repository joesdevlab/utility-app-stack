import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { toFile } from "openai";
import { withAuth } from "@/lib/api-auth";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit for audio files

async function handleTranscribe(request: NextRequest) {
  // Check if API key is available
  const apiKeyExists = !!process.env.OPENAI_API_KEY;

  if (!apiKeyExists) {
    console.error("OPENAI_API_KEY environment variable is not set");
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file size (AL-004)
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Audio file exceeds 25MB limit" },
        { status: 400 }
      );
    }

    // Convert the File to a format OpenAI accepts
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const file = await toFile(buffer, "audio.webm", { type: "audio/webm" });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error) {
    console.error("Transcription error:", error);

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isOpenAIError = errorMessage.includes("OpenAI") || errorMessage.includes("API");

    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        code: isOpenAIError ? "OPENAI_ERROR" : "TRANSCRIPTION_ERROR"
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleTranscribe);
