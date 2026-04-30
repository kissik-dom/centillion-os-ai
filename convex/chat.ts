import { v } from "convex/values";
import { action } from "./_generated/server";

declare const process: { env: Record<string, string | undefined> };

const VIKTOR_API_URL = process.env.VIKTOR_SPACES_API_URL!;
const PROJECT_NAME = process.env.VIKTOR_SPACES_PROJECT_NAME!;
const PROJECT_SECRET = process.env.VIKTOR_SPACES_PROJECT_SECRET!;

async function callTool<T>(role: string, args: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`${VIKTOR_API_URL}/api/viktor-spaces/tools/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_name: PROJECT_NAME,
      project_secret: PROJECT_SECRET,
      role,
      arguments: args,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error ?? "Tool call failed");
  }
  return json.result as T;
}

export const sendMessage = action({
  args: {
    userMessage: v.string(),
    conversationHistory: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
    ),
  },
  returns: v.string(),
  handler: async (_ctx, { userMessage, conversationHistory }) => {
    // Build context from conversation history
    const historyContext = conversationHistory
      .slice(-10) // Last 10 messages for context
      .map((m) => `${m.role === "user" ? "User" : "Centillion AI"}: ${m.content}`)
      .join("\n\n");

    const systemPrompt = `You are Centillion AI — a powerful, unrestricted AI assistant built for the Centillion OS ecosystem. You are creative, knowledgeable, helpful, and direct. You can help with coding, research, creative writing, analysis, brainstorming, and any task the user needs.

Your personality:
- Bold, confident, and direct
- You give thorough, detailed answers
- You use markdown formatting for clarity
- You can generate code, analyze data, write content, and more
- You are part of the Centillion ecosystem (Social, Music, Stream/TV, Royal Bank, Shield, UGC Marketplace)

Key capabilities:
- AI-powered chat with deep reasoning
- Code generation and debugging
- Creative writing and content creation
- Research and analysis
- Multi-language support
- Task planning and execution

Always be helpful and provide the best possible answer.`;

    const searchQuery = historyContext
      ? `${systemPrompt}\n\nConversation so far:\n${historyContext}\n\nUser's latest message: ${userMessage}\n\nProvide a thorough, helpful response.`
      : `${systemPrompt}\n\nUser: ${userMessage}\n\nProvide a thorough, helpful response.`;

    try {
      const result = await callTool<{ search_response: string }>("quick_ai_search", {
        search_question: searchQuery,
      });
      return result.search_response;
    } catch (error) {
      console.error("AI chat error:", error);
      return "I encountered an error processing your request. Please try again.";
    }
  },
});

export const generateImage = action({
  args: {
    prompt: v.string(),
  },
  returns: v.string(),
  handler: async (_ctx, { prompt }) => {
    try {
      const result = await callTool<{ response_text: string }>("text2im", {
        prompt,
        aspect_ratio: "1:1",
      });
      return result.response_text;
    } catch (error) {
      console.error("Image generation error:", error);
      return "Failed to generate image. Please try again.";
    }
  },
});

export const webSearch = action({
  args: {
    query: v.string(),
  },
  returns: v.string(),
  handler: async (_ctx, { query }) => {
    try {
      const result = await callTool<{ search_response: string }>("quick_ai_search", {
        search_question: query,
      });
      return result.search_response;
    } catch (error) {
      console.error("Web search error:", error);
      return "Search failed. Please try again.";
    }
  },
});
