import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowUp,
  Bot,
  ChevronDown,
  Code,
  Globe,
  Image,
  Loader2,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ── Model Info ──────────────────────────────────────────────────────────────
const MODELS = [
  { id: "auto", name: "Auto Router", desc: "Best model per task", icon: "🧠" },
  { id: "deepseek-r1", name: "DeepSeek-R1", desc: "Reasoning & math", icon: "🔬" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", desc: "General & code", icon: "🦙" },
  { id: "llama-3.1-8b", name: "Llama 3.1 8B", desc: "Fast responses", icon: "⚡" },
  { id: "gemma2-9b", name: "Gemma 2 9B", desc: "Code & reasoning", icon: "💎" },
  { id: "mixtral-8x7b", name: "Mixtral 8x7B", desc: "Creative & code", icon: "🌀" },
];

const MODEL_BADGES: Record<string, { label: string; color: string }> = {
  "deepseek-r1": { label: "DeepSeek-R1", color: "bg-[#D4AF37]/15 text-[#D4AF37]" },
  "llama-3.3-70b": { label: "Llama 3.3 70B", color: "bg-[#4A8CB8]/15 text-[#4A8CB8]" },
  "llama-3.1-8b": { label: "Llama 3.1 8B", color: "bg-[#2E8B57]/15 text-[#2E8B57]" },
  "gemma2-9b": { label: "Gemma 2 9B", color: "bg-[#F0D060]/15 text-[#F0D060]" },
  "mixtral-8x7b": { label: "Mixtral 8x7B", color: "bg-[#A67C00]/15 text-[#A67C00]" },
  "phi-3.5-mini": { label: "Phi 3.5 Mini", color: "bg-[#CC5500]/15 text-[#CC5500]" },
};

// ── Markdown Rendering ──────────────────────────────────────────────────────
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("```")) return null;
        if (line.startsWith("### "))
          return <h3 key={i} className="text-base font-semibold mt-3">{line.slice(4)}</h3>;
        if (line.startsWith("## "))
          return <h2 key={i} className="text-lg font-bold mt-4">{line.slice(3)}</h2>;
        if (line.startsWith("# "))
          return <h1 key={i} className="text-xl font-bold mt-4">{line.slice(2)}</h1>;
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-[#D4AF37] mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
            </div>
          );
        }
        if (/^\d+\. /.test(line)) {
          const num = line.match(/^(\d+)\. /)?.[1];
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-[#D4AF37] font-mono text-xs mt-0.5">{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\. /, "")) }} />
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
      })}
      {content.includes("```") && renderCodeBlocks(content)}
    </div>
  );
}

function renderCodeBlocks(content: string) {
  const blocks: { lang: string; code: string }[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    blocks.push({ lang: match[1] || "code", code: match[2].trim() });
  }
  if (blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block, i) => (
        <div key={i} className="mt-3 rounded-lg overflow-hidden border border-[rgba(212,175,55,0.12)]">
          <div className="bg-[#142D4A] px-3 py-1.5 text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <Code className="size-3" /> {block.lang}
          </div>
          <pre className="bg-[#081422] p-4 overflow-x-auto text-xs font-mono">
            <code>{block.code}</code>
          </pre>
        </div>
      ))}
    </>
  );
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /`(.+?)`/g,
      '<code class="bg-[#142D4A] px-1.5 py-0.5 rounded text-[#F0D060] text-xs font-mono">$1</code>',
    )
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" target="_blank" class="text-[#D4AF37] hover:underline">$1</a>',
    );
}

// ── Model Selector Dropdown ─────────────────────────────────────────────────
function ModelSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = MODELS.find((m) => m.id === selected) || MODELS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#142D4A] border border-[rgba(212,175,55,0.12)] hover:border-[#D4AF37]/30 transition-colors text-xs"
      >
        <span>{current.icon}</span>
        <span className="text-muted-foreground">{current.name}</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-0 w-56 bg-[#0F2038] border border-[rgba(212,175,55,0.15)] rounded-xl shadow-xl z-50 overflow-hidden">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onSelect(m.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#142D4A] transition-colors ${
                selected === m.id ? "bg-[#142D4A] border-l-2 border-l-[#D4AF37]" : ""
              }`}
            >
              <span className="text-base">{m.icon}</span>
              <div>
                <p className="text-xs font-medium">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Suggestions ─────────────────────────────────────────────────────────────
const suggestions = [
  { icon: Code, text: "Write a React component", desc: "with TypeScript and Tailwind" },
  { icon: Globe, text: "Deep research", desc: "on any topic with analysis" },
  { icon: Image, text: "Generate an image prompt", desc: "detailed and creative" },
  { icon: Sparkles, text: "Help me brainstorm", desc: "sovereign ecosystem ideas" },
];

// ── Chat Page ───────────────────────────────────────────────────────────────
export function ChatPage() {
  const { conversationId } = useParams();
  const convId = conversationId as Id<"conversations"> | undefined;

  const messages = useQuery(api.messages.list, convId ? { conversationId: convId } : "skip");
  const sendMessage = useMutation(api.messages.send);
  const addAssistant = useMutation(api.messages.addAssistant);
  const createConversation = useMutation(api.conversations.create);
  const chatAction = useAction(api.chat.sendMessage);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    async (text?: string) => {
      const message = text || input.trim();
      if (!message || isLoading) return;
      setInput("");
      setIsLoading(true);

      try {
        let activeConvId = convId;
        if (!activeConvId) {
          activeConvId = await createConversation({ title: message.slice(0, 60) });
          window.history.replaceState(null, "", `/chat/${activeConvId}`);
        }

        await sendMessage({ conversationId: activeConvId, content: message });

        const history = (messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Call AI with model preference
        const result = await chatAction({
          userMessage: message,
          conversationHistory: history,
          preferredModel: selectedModel === "auto" ? undefined : selectedModel,
        });

        await addAssistant({
          conversationId: activeConvId,
          content: result.content,
          modelUsed: result.modelUsed,
          taskType: result.taskType,
        });
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, convId, messages, sendMessage, addAssistant, createConversation, chatAction, selectedModel],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-2xl opacity-20 bg-[#D4AF37] rounded-full scale-150" />
              <div className="relative size-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8B6914] flex items-center justify-center glow-gold">
                <Sparkles className="size-8 text-[#0A1628]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gradient-royal">What can I help you with?</h2>
            <p className="text-muted-foreground text-sm mb-2">
              Powered by Smart Model Router — 6 AI models, auto-selected per task
            </p>
            <div className="flex items-center gap-1.5 mb-8">
              {["🔬", "🦙", "⚡", "💎", "🌀"].map((e, i) => (
                <span key={i} className="text-sm">{e}</span>
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                DeepSeek · Llama · Gemma · Mixtral
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text + " " + s.desc)}
                  className="flex items-start gap-3 p-4 rounded-xl card-royal hover:border-[#D4AF37]/30 transition-all text-left group"
                >
                  <s.icon className="size-5 text-[#D4AF37] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium group-hover:text-[#D4AF37] transition-colors">
                      {s.text}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg._id} className="flex gap-3">
                <div
                  className={`shrink-0 size-8 rounded-lg flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-[#142D4A] border border-[rgba(212,175,55,0.12)]"
                      : "bg-gradient-to-br from-[#D4AF37] to-[#8B6914]"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="size-4 text-muted-foreground" />
                  ) : (
                    <Bot className="size-4 text-[#0A1628]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      {msg.role === "user" ? "You" : "Centillion AI"}
                    </p>
                    {msg.role === "assistant" && msg.modelUsed && MODEL_BADGES[msg.modelUsed] && (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${MODEL_BADGES[msg.modelUsed].color}`}
                      >
                        <Zap className="size-2.5" />
                        {MODEL_BADGES[msg.modelUsed].label}
                      </span>
                    )}
                    {msg.role === "assistant" && msg.taskType && (
                      <span className="text-[10px] text-muted-foreground/60 capitalize">
                        {msg.taskType}
                      </span>
                    )}
                  </div>
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <MarkdownContent content={msg.content} />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="shrink-0 size-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8B6914] flex items-center justify-center">
                  <Bot className="size-4 text-[#0A1628]" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Centillion AI
                  </p>
                  <div className="flex gap-1.5">
                    <div className="size-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="size-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="size-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[rgba(212,175,55,0.08)] bg-[#0A1628] px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end bg-[#0F2038] rounded-xl border border-[rgba(212,175,55,0.12)] focus-within:border-[#D4AF37]/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Centillion AI anything..."
              rows={1}
              className="flex-1 bg-transparent px-4 py-3 text-sm resize-none outline-none placeholder:text-muted-foreground max-h-[200px]"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="m-1.5 size-8 rounded-lg bg-[#D4AF37] hover:bg-[#A67C00] text-[#0A1628] disabled:opacity-30 shrink-0"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <ModelSelector selected={selectedModel} onSelect={setSelectedModel} />
            <p className="text-[10px] text-muted-foreground">
              Centillion AI · Royal Kissi Kingdom · Sovereign Intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
