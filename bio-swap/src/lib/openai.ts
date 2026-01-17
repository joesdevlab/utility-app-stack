import OpenAI from "openai";

// Lazy initialization to avoid build-time errors
let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
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
    model: "gpt-4o",
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
    model: "gpt-4o",
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
