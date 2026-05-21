import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Centillion AI Chat Backend — 100% FREE
 * Uses Groq API free tier (Llama 3.3 70B) — 14,400 req/day
 * Fallback: HuggingFace Inference API (free, no key needed)
 */

declare const process: { env: Record<string, string | undefined> };

// Groq API — free tier, fast inference
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function chatWithGroq(
  messages: { role: string; content: string }[],
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  
  if (groqKey) {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (response.ok) {
      const data = await response.json() as { choices: { message: { content: string } }[] };
      return data.choices[0]?.message?.content || "No response generated.";
    }
    
    // If rate limited, fall through to HF
    const errorText = await response.text();
    console.error("Groq error:", errorText);
  }

  // Fallback: HuggingFace Inference API (free, no key)
  return chatWithHuggingFace(messages);
}

async function chatWithHuggingFace(
  messages: { role: string; content: string }[],
): Promise<string> {
  const prompt = messages
    .map((m) => {
      if (m.role === "system") return `<|system|>\n${m.content}<|end|>`;
      if (m.role === "user") return `<|user|>\n${m.content}<|end|>`;
      return `<|assistant|>\n${m.content}<|end|>`;
    })
    .join("\n") + "\n<|assistant|>\n";

  const hfToken = process.env.HF_API_KEY;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (hfToken) {
    headers.Authorization = `Bearer ${hfToken}`;
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/models/microsoft/Phi-3.5-mini-instruct",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF API error: ${err}`);
  }

  const data = await response.json() as { generated_text: string }[];
  return data[0]?.generated_text?.trim() || "I couldn't generate a response. Please try again.";
}

const SYSTEM_PROMPT = `You are Centillion AI — the Royal Kissi Kingdom's intelligent assistant, powered by open-source AI.

Your personality:
- Bold, confident, direct, and thorough
- You use markdown formatting for clarity
- You are part of the Centillion OS ecosystem (Social, Music, Stream/TV, Royal Bank, Shield, UGC Marketplace)

Key capabilities:
- Deep reasoning and analysis
- Code generation and debugging
- Creative writing and content creation
- Research assistance
- Multi-language support
- Task planning and execution

Respond helpfully and accurately. If you don't know something, say so rather than guessing.`;

export const sendMessage = action({
  args: {
    userMessage: v.string(),
    conversationHistory: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      }),
    ),
  },
  returns: v.string(),
  handler: async (_ctx, { userMessage, conversationHistory }) => {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    try {
      return await chatWithGroq(messages);
    } catch (error) {
      console.error("Chat error:", error);
      return "I encountered an error. Please try again in a moment.";
    }
  },
});

export const webSearch = action({
  args: {
    query: v.string(),
  },
  returns: v.string(),
  handler: async (_ctx, { query }) => {
    // Use Groq with a search-oriented prompt
    const messages = [
      {
        role: "system",
        content:
          "You are a research assistant. Answer the user's question with detailed, accurate information. Cite sources when possible.",
      },
      { role: "user", content: query },
    ];

    try {
      return await chatWithGroq(messages);
    } catch (error) {
      console.error("Search error:", error);
      return "Search failed. Please try again.";
    }
  },
});
