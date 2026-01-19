import OpenAI from "openai";

// Create a new OpenAI client for each request to ensure env vars are fresh
export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("OPENAI_API_KEY environment variable is not set");
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  return new OpenAI({
    apiKey: apiKey,
  });
}

// Legacy export for backwards compatibility
export const openai = {
  get audio() {
    return getOpenAI().audio;
  },
  get chat() {
    return getOpenAI().chat;
  },
};

// Text completion with GPT-4o
export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const client = getOpenAI();
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  return response.choices[0]?.message?.content ?? "";
}

// Voice transcription with Whisper
export async function transcribeAudio(
  audioFile: File | Blob
): Promise<string> {
  const client = getOpenAI();
  const response = await client.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });

  return response.text;
}

// Image analysis with GPT-4o Vision
export async function analyzeImage(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}

// Analyze image from base64
export async function analyzeImageBase64(
  base64Image: string,
  prompt: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const imageUrl = `data:${mimeType};base64,${base64Image}`;
  return analyzeImage(imageUrl, prompt);
}
