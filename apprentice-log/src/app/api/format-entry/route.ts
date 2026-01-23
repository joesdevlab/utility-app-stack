import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { withAuth } from "@/lib/api-auth";

const MAX_TRANSCRIPT_LENGTH = 10000; // 10,000 character limit

const SYSTEM_PROMPT = `You are an assistant that helps BCITO (Building and Construction Industry Training Organisation) apprentices fill out their daily logbook entries.

Given a voice transcript of what the apprentice did today, extract and format the information into a structured logbook entry.

You must respond with valid JSON in this exact format:
{
  "date": "YYYY-MM-DD",
  "formattedEntry": "A well-written paragraph summarizing the day's work in a professional logbook style",
  "tasks": [
    {
      "description": "Brief description of the task",
      "hours": 1.5,
      "tools": ["List", "of", "tools", "used"],
      "skills": ["Relevant", "skills", "practiced"]
    }
  ],
  "totalHours": 8,
  "notes": "Any additional notes or observations",
  "safetyObservations": "Any safety-related observations or practices"
}

Guidelines:
- Use today's date if not specified
- Write a professional formattedEntry that summarizes the day's work in 2-3 sentences
- Estimate hours based on context (full day is usually 8-9 hours)
- Extract specific tools mentioned (nail gun, circular saw, level, etc.)
- Map tasks to relevant BCITO skills where possible (framing, roofing, foundations, etc.)
- Include safety observations if mentioned (PPE, site hazards, etc.)
- Keep descriptions professional and concise
- If the transcript is unclear, make reasonable assumptions and note them`;

async function handleFormatEntry(request: NextRequest) {
  try {
    const { transcript, date } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 }
      );
    }

    // Validate transcript length (AL-003)
    if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
      return NextResponse.json(
        { error: "Transcript exceeds 10,000 character limit" },
        { status: 400 }
      );
    }

    const today = date || new Date().toISOString().split("T")[0];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Today's date is ${today}. Here's what the apprentice said:\n\n"${transcript}"`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const entry = JSON.parse(content);

    return NextResponse.json(entry);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Format entry error:", errorMessage, error);

    // Check for specific error types
    if (errorMessage.includes("JSON")) {
      return NextResponse.json(
        { error: "Failed to parse AI response", details: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to format logbook entry", details: errorMessage },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleFormatEntry, { rateLimitType: "ai" });
