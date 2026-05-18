import { useRef, useState } from "react";
import { ImagePlus, Send, Square, X } from "lucide-react";

type Props = {
  loading: boolean;
  onSend: (prompt: string, imageFile: File | null, imageDataUrl: string | null) => void;
  onAbort: () => void;
};

export function ChatComposer({ loading, onSend, onAbort }: Props) {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = (prompt.trim().length > 0 || image) && !loading;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;

    onSend(prompt.trim(), imageFile, image);
    setPrompt("");
    setImage(null);
    setImageFile(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }

    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <form
      onSubmit={submit}
      onClick={() => textareaRef.current?.focus()}
      className="glass relative z-10 rounded-2xl p-3 shadow-soft"
    >
      {image && (
        <div className="relative mb-2 inline-block">
          <img src={image} alt="attachment" className="h-20 w-20 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => {
              setImage(null);
              setImageFile(null);
              if (fileRef.current) {
                fileRef.current.value = "";
              }
            }}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Attach image"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
        />
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask EduMentra anything..."
          rows={1}
          className="max-h-40 min-h-[40px] flex-1 resize-none rounded-xl border border-border bg-white/85 px-4 py-2.5 text-sm text-foreground caret-[var(--brand)] shadow-soft outline-none transition-colors placeholder:text-muted-foreground focus:bg-white focus:ring-2 focus:ring-[var(--brand)]/40"
        />
        <button
          type={loading ? "button" : "submit"}
          onClick={loading ? onAbort : undefined}
          disabled={!loading && !canSend}
          className="gradient-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          aria-label={loading ? "Stop response" : "Send"}
        >
          {loading ? <Square className="h-4 w-4 fill-current" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-2 px-1 text-[11px] text-muted-foreground">
        Press Enter to send - Shift + Enter for new line
      </p>
    </form>
  );
}
