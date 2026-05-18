import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Navbar } from "@/components/dashboard/Navbar";
import { ChatMessage } from "@/components/dashboard/ChatMessage";
import { ChatComposer } from "@/components/dashboard/ChatComposer";
import { askAi } from "@/components/dashboard/api";
import type { ChatMessage as ChatMessageType } from "@/components/dashboard/types";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Gemma4 - AI Study Chat" },
      {
        name: "description",
        content:
          "Gemma4 hackathon project: a chat-based AI study assistant. Ask questions, share images, get instant answers.",
      },
    ],
  }),
});

const SUGGESTIONS = [
  "Explain Newton's third law with an example",
  "Summarize photosynthesis in 3 bullets",
  "Help me solve a quadratic equation",
  "What is the difference between RAM and ROM?",
];

function Dashboard() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (prompt: string, imageDataUrl: string | null) => {
    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      imageDataUrl,
      createdAt: new Date().toISOString(),
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessageType = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
      createdAt: new Date().toISOString(),
    };
    const next = [...messages, userMsg, assistantMsg];

    setMessages(next);
    setLoading(true);

    try {
      const reply = await askAi(
        { prompt, imageDataUrl, history: [...messages, userMsg] },
        {
          onChunk: (chunk) => {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      content: message.content + chunk,
                      streaming: false,
                    }
                  : message,
              ),
            );
          },
        },
      );

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...reply,
                id: assistantId,
                streaming: false,
              }
            : message,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong while calling the chat API.";
      const cleanedMessage = message.replace(/\s+/g, " ").trim();

      setMessages((current) =>
        current.map((entry) =>
          entry.id === assistantId
            ? {
                ...entry,
                content: [
                  "I couldn't finish that response right now.",
                  "",
                  "Please try sending your message again in a moment.",
                  "",
                  `Error details: \`${cleanedMessage || "Unknown error"}\``,
                ].join("\n"),
                streaming: false,
              }
            : entry,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex min-h-screen flex-col px-4 pb-4 sm:px-6">
      <Navbar />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6">
          {isEmpty ? (
            <section className="flex h-full flex-col items-center justify-center text-center animate-fade-in">
              <div className="gradient-brand mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-soft">
                <Sparkles className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                <span className="gradient-text">Gemma-4</span>
              </h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Ask anything - type a question or attach an image to get started.
              </p>
              <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s, null)}
                    className="glass rounded-xl px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <div className="space-y-5">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 pb-2 pt-2">
          <ChatComposer loading={loading} onSend={handleSend} />
        </div>
      </main>
    </div>
  );
}
