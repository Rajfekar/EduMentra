import { Sparkles, User } from "lucide-react";
import QuestionViewer from "./QuestionViewer";
import type { ChatMessage as ChatMessageType } from "./types";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  const showTyping = !isUser && message.streaming && !message.content.trim();
  const hasContent = message.content.trim().length > 0;

  return (
    <div
      className={`flex w-full min-w-0 gap-3 animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="gradient-brand mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-soft">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <div className={`min-w-0 max-w-[min(82%,46rem)] ${isUser ? "order-1" : ""}`}>
        {!isUser && (
          <div className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            AI assistant
          </div>
        )}
        <div
          className={`min-w-0 overflow-hidden rounded-2xl px-4 py-3 text-sm shadow-soft ${
            isUser
              ? "gradient-brand rounded-br-md text-white"
              : "rounded-bl-md border border-border bg-white/90 text-foreground"
          }`}
        >
          {message.imageDataUrl && (
            <img
              src={message.imageDataUrl}
              alt="attachment"
              className="mb-3 max-h-60 w-full rounded-xl object-cover"
            />
          )}
          {showTyping ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
            </div>
          ) : isUser ? (
            <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
          ) : hasContent ? (
            <QuestionViewer data={message.content} />
          ) : (
            <p className="text-sm leading-7 text-muted-foreground">
              No response was generated. Please try again.
            </p>
          )}
        </div>
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-soft">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex w-full min-w-0 gap-3 animate-fade-in">
      <div className="gradient-brand mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-soft">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 max-w-[min(82%,46rem)]">
        <div className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          AI assistant
        </div>
        <div className="rounded-2xl rounded-bl-md border border-border bg-white/90 px-4 py-3 shadow-soft">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
