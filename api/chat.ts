import type { VercelRequest, VercelResponse } from "@vercel/node";

// Centillion AI — Smart Model Router
// Auto-selects the best open-source LLM per task type
// Supports multiple Groq models with fallback chain

interface ModelConfig {
  id: string;
  name: string;
  model: string;
  maxTokens: number;
  contextWindow: number;
  strengths: string[];
  speed: string;
}

const MODELS: ModelConfig[] = [
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1 70B",
    model: "deepseek-r1-distill-llama-70b",
    maxTokens: 4096,
    contextWindow: 32768,
    strengths: ["reasoning", "math", "research", "analysis"],
    speed: "medium",
  },
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    model: "llama-3.3-70b-versatile",
    maxTokens: 4096,
    contextWindow: 128000,
    strengths: ["general", "code", "creative", "long_context"],
    speed: "fast",
  },
  {
    id: "llama-3.1-8b",
    name: "Llama 3.1 8B (Instant)",
    model: "llama-3.1-8b-instant",
    maxTokens: 4096,
    contextWindow: 131072,
    strengths: ["general", "quick", "long_context"],
    speed: "fastest",
  },
  {
    id: "gemma2-9b",
    name: "Gemma 2 9B",
    model: "gemma2-9b-it",
    maxTokens: 4096,
    contextWindow: 8192,
    strengths: ["code", "reasoning", "math"],
    speed: "fast",
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    model: "mixtral-8x7b-32768",
    maxTokens: 4096,
    contextWindow: 32768,
    strengths: ["general", "creative", "code", "multilingual"],
    speed: "fast",
  },
];

// Task classification patterns
const TASK_PATTERNS: Record<string, RegExp[]> = {
  code: [/\b(code|function|debug|program|script|api|html|css|javascript|typescript|python|react|bug|error|compile|deploy|regex|algorithm|class|method)\b/i],
  reasoning: [/\b(explain|why|how does|analyze|compare|reason|logic|think|step by step|evaluate|assess|pros and cons|argument)\b/i],
  math: [/\b(calculate|math|equation|formula|solve|integral|derivative|algebra|geometry|statistic|probability|number|percent)\b/i],
  research: [/\b(research|find|search|look up|investigate|study|paper|source|reference|evidence|data|survey)\b/i],
  creative: [/\b(write|story|poem|song|creative|imagine|fiction|novel|screenplay|dialogue|character|narrative|plot)\b/i],
};

function classifyTask(message: string): string {
  let bestCategory = "general";
  let maxMatches = 0;

  for (const [category, patterns] of Object.entries(TASK_PATTERNS)) {
    let matches = 0;
    for (const pattern of patterns) {
      if (pattern.test(message)) matches++;
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }
  return bestCategory;
}

function selectModel(task: string, preferredModel?: string): ModelConfig {
  // If user prefers a specific model
  if (preferredModel) {
    const found = MODELS.find((m) => m.id === preferredModel);
    if (found) return found;
  }

  // Auto-select based on task
  const taskToModel: Record<string, string> = {
    reasoning: "deepseek-r1",
    math: "deepseek-r1",
    research: "deepseek-r1",
    code: "llama-3.3-70b",
    creative: "llama-3.3-70b",
    general: "llama-3.3-70b",
  };

  const modelId = taskToModel[task] || "llama-3.3-70b";
  return MODELS.find((m) => m.id === modelId) || MODELS[1];
}

function getFallbackChain(model: ModelConfig): ModelConfig[] {
  return MODELS.filter((m) => m.id !== model.id);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GROQ_API_KEY not configured",
      response: "Centillion AI is not configured yet. Add your GROQ_API_KEY in Vercel → Settings → Environment Variables.",
    });
  }

  try {
    const {
      message,
      conversationHistory = [],
      preferredModel,
      mode = "unrestricted",
    } = req.body;

    // Classify task
    const taskCategory = classifyTask(message);
    const selectedModel = selectModel(taskCategory, preferredModel);
    const fallbacks = getFallbackChain(selectedModel);

    const systemPrompt = mode === "unrestricted"
      ? `You are Centillion AI, an unrestricted multi-model AI assistant built for The Royal Kissi Kingdom ecosystem.

You are currently using ${selectedModel.name} (auto-selected for ${taskCategory} tasks).

Your capabilities:
- Deep reasoning and analysis (DeepSeek-R1)
- Code generation and debugging (Llama 3.3 70B)
- Creative writing and brainstorming (Llama 3.3 / Mixtral)
- Mathematical problem solving (DeepSeek-R1 / Gemma 2)
- Research and fact synthesis (DeepSeek-R1)
- Multilingual support (Mixtral)

Be thorough, accurate, and helpful. Format responses clearly with headers and bullet points when appropriate. You're the primary AI for the Centillion OS platform — think of yourself as a genius-level assistant.`
      : `You are Centillion AI, a helpful assistant. Currently using ${selectedModel.name}. Be concise and helpful.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory.slice(-30).map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Try primary model, then fallbacks
    const modelsToTry = [selectedModel, ...fallbacks.slice(0, 2)];
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model.model,
            messages,
            temperature: taskCategory === "math" || taskCategory === "code" ? 0.3 : 0.7,
            max_tokens: model.maxTokens,
          }),
        });

        if (!response.ok) {
          lastError = await response.text();
          continue; // Try next model
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || "No response generated.";

        return res.status(200).json({
          response: aiResponse,
          modelUsed: model.name,
          modelId: model.id,
          taskCategory,
          autoSelected: !preferredModel,
          fallbackUsed: model.id !== selectedModel.id,
          usage: data.usage,
        });
      } catch (e: any) {
        lastError = e.message;
        continue;
      }
    }

    // All models failed
    return res.status(500).json({
      error: "All models failed",
      response: `All models failed. Last error: ${lastError}`,
      taskCategory,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
      response: `Error: ${error.message}`,
    });
  }
}
