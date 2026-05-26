import { v } from "convex/values";
import { action } from "./_generated/server";
import { routeAndChat, MODEL_REGISTRY } from "./modelRouter";

/**
 * Centillion AI Chat Backend — Smart Model Router
 * Auto-selects the best open-source LLM for each task.
 * 6 models: DeepSeek-R1, Llama 3.3 70B, Llama 3.1 8B, Gemma 2, Mixtral, Phi-3.5
 * Fallback chain: if primary model fails, auto-routes to next best.
 */

const SYSTEM_PROMPT = `You are Centillion AI — the Royal Kissi Kingdom's sovereign intelligence system.

You are powered by the Centillion Smart Model Router, which auto-selects the best open-source LLM for each task. You have access to:
- DeepSeek-R1 (reasoning, math, research)
- Llama 3.3 70B (general, code, creative)
- Llama 3.1 8B Instant (fast responses, long context)
- Gemma 2 9B (code, reasoning, math)
- Mixtral 8x7B (general, creative, code)

Your personality:
- Bold, confident, direct, thorough
- You use markdown formatting for clarity
- You are the core intelligence of the Centillion OS ecosystem

Capabilities:
- Deep reasoning and chain-of-thought analysis
- Code generation, debugging, and architecture
- Creative writing, content creation, storytelling
- Research, data analysis, and reporting
- Mathematical computation and proofs
- Multi-language support
- Task planning and execution

Always respond accurately and completely. Use your full knowledge.`;

export const sendMessage = action({
  args: {
    userMessage: v.string(),
    conversationHistory: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      }),
    ),
    preferredModel: v.optional(v.string()),
  },
  returns: v.object({
    content: v.string(),
    modelUsed: v.string(),
    taskType: v.string(),
  }),
  handler: async (_ctx, { userMessage, conversationHistory, preferredModel }) => {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    try {
      const result = await routeAndChat(messages, preferredModel);
      return {
        content: result.response,
        modelUsed: result.modelUsed,
        taskType: result.taskType,
      };
    } catch (error) {
      console.error("Chat error:", error);
      return {
        content: "All models are currently unavailable. Please try again in a moment.",
        modelUsed: "none",
        taskType: "general",
      };
    }
  },
});

export const webSearch = action({
  args: {
    query: v.string(),
  },
  returns: v.object({
    content: v.string(),
    modelUsed: v.string(),
    taskType: v.string(),
  }),
  handler: async (_ctx, { query }) => {
    const messages = [
      {
        role: "system",
        content:
          "You are a research assistant. Answer the user's question with detailed, accurate information. Provide comprehensive analysis.",
      },
      { role: "user", content: query },
    ];

    try {
      const result = await routeAndChat(messages, "deepseek-r1");
      return {
        content: result.response,
        modelUsed: result.modelUsed,
        taskType: "research",
      };
    } catch (error) {
      console.error("Search error:", error);
      return {
        content: "Search failed. Please try again.",
        modelUsed: "none",
        taskType: "research",
      };
    }
  },
});

export const listModels = action({
  args: {},
  returns: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      provider: v.string(),
      strengths: v.array(v.string()),
      speed: v.string(),
      license: v.string(),
    }),
  ),
  handler: async () => {
    return MODEL_REGISTRY.map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      strengths: m.strengths,
      speed: m.speed,
      license: m.license,
    }));
  },
});
