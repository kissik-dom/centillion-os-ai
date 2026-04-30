import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowUp,
  Bot,
  Code,
  Globe,
  Image,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown rendering — bold, code, lists, links
  const lines = content.split("\n");
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        // Code block
        if (line.startsWith("```")) {
          return null; // Handled in block logic below
        }
        // Headers
        if (line.startsWith("### ")) {
          return <h3 key={i} className="text-base font-semibold mt-3">{line.slice(4)}</h3>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="text-lg font-bold mt-4">{line.slice(3)}</h2>;
        }
        if (line.startsWith("# ")) {
          return <h1 key={i} className="text-xl font-bold mt-4">{line.slice(2)}</h1>;
        }
        // Bullet points
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-[#E91E8C] mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
            </div>
          );
        }
        // Numbered list
        if (/^\d+\. /.test(line)) {
          const num = line.match(/^(\d+)\. /)?.[1];
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-[#E91E8C] font-mono text-xs mt-0.5">{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\. /, "")) }} />
            </div>
          );
        }
        // Empty line
        if (line.trim() === "") return <div key={i} className="h-1" />;
        // Regular paragraph
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
      })}
      {/* Handle code blocks */}
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
        <div key={i} className="mt-3 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)]">
          <div className="bg-[#1A1A24] px-3 py-1.5 text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <Code className="size-3" /> {block.lang}
          </div>
          <pre className="bg-[#0D0D14] p-4 overflow-x-auto text-xs font-mono">
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
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-[#1A1A24] px-1.5 py-0.5 rounded text-[#FF4DA6] text-xs font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="text-[#E91E8C] hover:underline">$1</a>');
}

const suggestions = [
  { icon: Code, text: "Write a React component", desc: "with TypeScript and Tailwind" },
  { icon: Globe, text: "Search the web", desc: "for the latest AI news" },
  { icon: Image, text: "Generate an image", desc: "of a futuristic city at night" },
  { icon: Sparkles, text: "Help me brainstorm", desc: "startup ideas for 2026" },
];

export function ChatPage() {
  const { conversationId } = useParams();
  const convId = conversationId as Id<"conversations"> | undefined;

  const messages = useQuery(
    api.messages.list,
    convId ? { conversationId: convId } : "skip"
  );
  const sendMessage = useMutation(api.messages.send);
  const addAssistant = useMutation(api.messages.addAssistant);
  const createConversation = useMutation(api.conversations.create);
  const chatAction = useAction(api.chat.sendMessage);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

        // Get conversation history for context
        const history = (messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Call AI
        const response = await chatAction({
          userMessage: message,
          conversationHistory: history,
        });

        await addAssistant({ conversationId: activeConvId, content: response });
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, convId, messages, sendMessage, addAssistant, createConversation, chatAction]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
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
          /* Empty state with suggestions */
          <div className="flex flex-col items-center justify-center h-full px-4 py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-2xl opacity-20 bg-[#E91E8C] rounded-full scale-150" />
              <div className="relative size-16 rounded-2xl bg-gradient-to-br from-[#E91E8C] to-[#C0186F] flex items-center justify-center">
                <Sparkles className="size-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">What can I help you with?</h2>
            <p className="text-muted-foreground text-sm mb-8">Ask anything — code, research, creative, analysis</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text + " " + s.desc)}
                  className="flex items-start gap-3 p-4 rounded-xl bg-[#12121A] border border-[rgba(255,255,255,0.06)] hover:border-[#E91E8C]/30 transition-all text-left group"
                >
                  <s.icon className="size-5 text-[#E91E8C] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium group-hover:text-[#E91E8C] transition-colors">{s.text}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message list */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg._id} className="flex gap-3">
                <div className={`shrink-0 size-8 rounded-lg flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-[#1A1A24] border border-[rgba(255,255,255,0.08)]"
                    : "bg-gradient-to-br from-[#E91E8C] to-[#C0186F]"
                }`}>
                  {msg.role === "user" ? (
                    <User className="size-4 text-muted-foreground" />
                  ) : (
                    <Bot className="size-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    {msg.role === "user" ? "You" : "Centillion AI"}
                  </p>
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
                <div className="shrink-0 size-8 rounded-lg bg-gradient-to-br from-[#E91E8C] to-[#C0186F] flex items-center justify-center">
                  <Bot className="size-4 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Centillion AI</p>
                  <div className="flex gap-1.5">
                    <div className="size-2 rounded-full bg-[#E91E8C] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="size-2 rounded-full bg-[#E91E8C] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="size-2 rounded-full bg-[#E91E8C] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[rgba(255,255,255,0.06)] bg-[#0A0A0F] px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end bg-[#12121A] rounded-xl border border-[rgba(255,255,255,0.08)] focus-within:border-[#E91E8C]/40 transition-colors">
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
              className="m-1.5 size-8 rounded-lg bg-[#E91E8C] hover:bg-[#C0186F] disabled:opacity-30 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Centillion AI · Powered by the Centillion OS Ecosystem
          </p>
        </div>
      </div>
    </div>
  );
}
