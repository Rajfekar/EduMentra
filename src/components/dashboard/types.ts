export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  imageDataUrl?: string | null;
  streaming?: boolean;
  createdAt: string;
};

export type AiQuery = {
  prompt: string;
  imageDataUrl: string | null;
  history: ChatMessage[];
};

export type ImageAiQuery = AiQuery & {
  imageFile: File;
};
