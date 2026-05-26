import type { VercelRequest, VercelResponse } from "@vercel/node";

// Centillion AI — Model Registry Endpoint
// Lists all available models and their capabilities

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  return res.status(200).json({
    models: [
      {
        id: "deepseek-r1",
        name: "DeepSeek-R1 70B",
        provider: "Groq",
        strengths: ["reasoning", "math", "research", "analysis"],
        speed: "medium",
        contextWindow: "32K",
        license: "MIT",
        status: "active",
      },
      {
        id: "llama-3.3-70b",
        name: "Llama 3.3 70B",
        provider: "Groq",
        strengths: ["general", "code", "creative", "long_context"],
        speed: "fast",
        contextWindow: "128K",
        license: "Meta Llama 3.3",
        status: "active",
      },
      {
        id: "llama-3.1-8b",
        name: "Llama 3.1 8B Instant",
        provider: "Groq",
        strengths: ["general", "quick", "long_context"],
        speed: "fastest",
        contextWindow: "131K",
        license: "Meta Llama 3.1",
        status: "active",
      },
      {
        id: "gemma2-9b",
        name: "Gemma 2 9B",
        provider: "Groq",
        strengths: ["code", "reasoning", "math"],
        speed: "fast",
        contextWindow: "8K",
        license: "Gemma",
        status: "active",
      },
      {
        id: "mixtral-8x7b",
        name: "Mixtral 8x7B",
        provider: "Groq",
        strengths: ["general", "creative", "code", "multilingual"],
        speed: "fast",
        contextWindow: "32K",
        license: "Apache 2.0",
        status: "active",
      },
    ],
    taskRouting: {
      reasoning: "deepseek-r1",
      math: "deepseek-r1",
      research: "deepseek-r1",
      code: "llama-3.3-70b",
      creative: "llama-3.3-70b",
      general: "llama-3.3-70b",
      quick: "llama-3.1-8b",
      multilingual: "mixtral-8x7b",
    },
    status: {
      totalModels: 5,
      activeModels: 5,
      totalProviders: 1,
      groqKeysConfigured: !!process.env.GROQ_API_KEY,
    },
  });
}
