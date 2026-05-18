import type { AiQuery, ChatMessage, ImageAiQuery } from "./types";

const API_URL = import.meta.env.VITE_GEMMA_API_URL ?? "http://34.72.169.163/gemma4/chat";
const IMAGE_UPLOAD_API_URL =
  import.meta.env.VITE_GEMMA_IMAGE_UPLOAD_API_URL ??
  "https://gemma4-api.nxgsols.com/gemma4/chat/image/upload";
const DEFAULT_IMAGE_PROMPT = "Explain this image";

type AskAiOptions = {
  onChunk?: (chunk: string) => void;
  signal?: AbortSignal;
};

type ApiMessage = {
  role: "user" | "assistant";
  content: string;
};

export function normalizeAiResponseText(text: string): string {
  return text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
}

function toApiMessages(history: ChatMessage[]): ApiMessage[] {
  return history
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

function extractTextChunk(payload: unknown): string {
  if (typeof payload === "string") {
    return normalizeAiResponseText(payload);
  }

  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.response === "string") return normalizeAiResponseText(record.response);
  if (typeof record.delta === "string") return normalizeAiResponseText(record.delta);
  if (typeof record.content === "string") return normalizeAiResponseText(record.content);
  if (typeof record.text === "string") return normalizeAiResponseText(record.text);

  const choices = record.choices;
  if (Array.isArray(choices)) {
    const firstChoice = choices[0];
    if (firstChoice && typeof firstChoice === "object") {
      const choiceRecord = firstChoice as Record<string, unknown>;
      if (typeof choiceRecord.text === "string") return normalizeAiResponseText(choiceRecord.text);

      const delta = choiceRecord.delta;
      if (delta && typeof delta === "object") {
        const deltaRecord = delta as Record<string, unknown>;
        if (typeof deltaRecord.content === "string") {
          return normalizeAiResponseText(deltaRecord.content);
        }
      }

      const message = choiceRecord.message;
      if (message && typeof message === "object") {
        const messageRecord = message as Record<string, unknown>;
        if (typeof messageRecord.content === "string") {
          return normalizeAiResponseText(messageRecord.content);
        }
      }
    }
  }

  return "";
}

function parseSseEvent(eventBlock: string): string {
  const data = eventBlock
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).replace(/^\s/, ""))
    .join("\n");

  if (!data || data === "[DONE]") {
    return "";
  }

  try {
    return extractTextChunk(JSON.parse(data));
  } catch {
    return normalizeAiResponseText(data);
  }
}

async function readStream(
  response: Response,
  contentType: string,
  onChunk?: (chunk: string) => void,
): Promise<string> {
  if (!response.body) {
    const text = await response.text();
    if (!text) return "";

    if (contentType.includes("application/json")) {
      try {
        return extractTextChunk(JSON.parse(text));
      } catch {
        return normalizeAiResponseText(text);
      }
    }

    return normalizeAiResponseText(text);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const isSse = contentType.includes("text/event-stream");

  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });

    if (isSse) {
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const eventBlock of events) {
        const chunk = parseSseEvent(eventBlock);
        if (!chunk) continue;
        fullText += chunk;
        onChunk?.(chunk);
      }
    } else if (!contentType.includes("application/json")) {
      if (buffer) {
        const chunk = normalizeAiResponseText(buffer);
        fullText += chunk;
        onChunk?.(chunk);
        buffer = "";
      }
    }

    if (done) {
      break;
    }
  }

  if (!buffer) {
    return fullText;
  }

  if (isSse) {
    const chunk = parseSseEvent(buffer);
    if (chunk) {
      fullText += chunk;
      onChunk?.(chunk);
    }
    return fullText;
  }

  if (contentType.includes("application/json")) {
    try {
      return extractTextChunk(JSON.parse(buffer));
    } catch {
      return normalizeAiResponseText(buffer);
    }
  }

  const chunk = normalizeAiResponseText(buffer);
  fullText += chunk;
  onChunk?.(chunk);
  return fullText;
}

export async function askAi(query: AiQuery, options: AskAiOptions = {}): Promise<ChatMessage> {
  const response = await fetch(API_URL, {
    method: "POST",
    signal: options.signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream, text/plain",
    },
    body: JSON.stringify({
      messages: toApiMessages(query.history),
      stream: false,
      max_new_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(errorBody || `Chat request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const content = await readStream(response, contentType, options.onChunk);

  // console.log("Gemma API response:", content);

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: content,
    createdAt: new Date().toISOString(),
  };
}

export async function askAiWithImage(
  query: ImageAiQuery,
  options: AskAiOptions = {},
): Promise<ChatMessage> {
  const formData = new FormData();
  formData.append("image", query.imageFile);
  formData.append("prompt", query.prompt.trim() || DEFAULT_IMAGE_PROMPT);
  formData.append("max_new_tokens", "4096");

  const response = await fetch(IMAGE_UPLOAD_API_URL, {
    method: "POST",
    signal: options.signal,
    headers: {
      Accept: "application/json, text/plain",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(errorBody || `Image chat request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const content = await readStream(response, contentType, options.onChunk);

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };
}
