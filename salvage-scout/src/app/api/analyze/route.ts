import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import type { MaterialAnalysis, MaterialCategory, MaterialCondition } from "@/types";

const SYSTEM_PROMPT = `You are an expert at identifying construction and building materials from photos.
You help people list leftover materials for free pickup by DIYers.

Analyze the photo and provide a structured response with:
1. A clear, descriptive title for the listing (be specific about the material)
2. A helpful description including approximate dimensions, quantity if visible, and any notable features
3. The most appropriate category from: timber, roofing, windows, doors, plumbing, electrical, concrete, insulation, flooring, fixtures, landscaping, other
4. The condition: new (unused/in packaging), good (used but excellent condition), fair (some wear but functional), salvage (needs repair/cleanup)
5. Suggested quantity description (e.g., "About 20 boards", "Single item", "Box of fittings")
6. 1-3 tips for the poster about making the listing more attractive or safety considerations

Respond ONLY with valid JSON in this exact format:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "condition": "string",
  "suggestedQuantity": "string",
  "tips": ["string"]
}`;

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this photo of construction/building materials and provide the listing details.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const analysis = JSON.parse(jsonMatch[0]) as MaterialAnalysis;

    // Validate the category
    const validCategories: MaterialCategory[] = [
      "timber", "roofing", "windows", "doors", "plumbing",
      "electrical", "concrete", "insulation", "flooring",
      "fixtures", "landscaping", "other"
    ];
    if (!validCategories.includes(analysis.category)) {
      analysis.category = "other";
    }

    // Validate the condition
    const validConditions: MaterialCondition[] = ["new", "good", "fair", "salvage"];
    if (!validConditions.includes(analysis.condition)) {
      analysis.condition = "fair";
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);

    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "API not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
