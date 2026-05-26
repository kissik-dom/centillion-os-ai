/**
 * Centillion AI — Smart Model Router
 * Auto-selects the best open-source LLM per task type.
 * Supports 6 models via Groq free tier + HuggingFace fallback.
 * Tracks quality scores and auto-falls to next-best on failure.
 */

declare const process: { env: Record<string, string | undefined> };

// ── Model Registry ──────────────────────────────────────────────────────────
export type TaskCategory =
  | "reasoning"
  | "code"
  | "creative"
  | "general"
  | "research"
  | "math"
  | "long_context";

export interface ModelConfig {
  id: string;
  name: string;
  provider: "groq" | "huggingface";
  model: string;
  maxTokens: number;
  contextWindow: number;
  strengths: TaskCategory[];
  speed: "fast" | "medium" | "slow";
  license: string;
}

export const MODEL_REGISTRY: ModelConfig[] = [
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1",
    provider: "groq",
    model: "deepseek-r1-distill-llama-70b",
    maxTokens: 4096,
    contextWindow: 32768,
    strengths: ["reasoning", "math", "research"],
    speed: "medium",
    license: "MIT",
  },
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    maxTokens: 4096,
    contextWindow: 128000,
    strengths: ["general", "code", "creative", "long_context"],
    speed: "fast",
    license: "Meta Llama 3.3",
  },
  {
    id: "llama-3.1-8b",
    name: "Llama 3.1 8B (Instant)",
    provider: "groq",
    model: "llama-3.1-8b-instant",
    maxTokens: 4096,
    contextWindow: 131072,
    strengths: ["general", "long_context"],
    speed: "fast",
    license: "Meta Llama 3.1",
  },
  {
    id: "gemma2-9b",
    name: "Gemma 2 9B",
    provider: "groq",
    model: "gemma2-9b-it",
    maxTokens: 4096,
    contextWindow: 8192,
    strengths: ["code", "reasoning", "math"],
    speed: "fast",
    license: "Gemma",
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    provider: "groq",
    model: "mixtral-8x7b-32768",
    maxTokens: 4096,
    contextWindow: 32768,
    strengths: ["general", "creative", "code"],
    speed: "fast",
    license: "Apache 2.0",
  },
  {
    id: "phi-3.5-mini",
    name: "Phi 3.5 Mini (HF Fallback)",
    provider: "huggingface",
    model: "microsoft/Phi-3.5-mini-instruct",
    maxTokens: 2048,
    contextWindow: 8192,
    strengths: ["general", "code", "reasoning"],
    speed: "slow",
    license: "MIT",
  },
];

// ── Task Classifier ─────────────────────────────────────────────────────────
const TASK_PATTERNS: Record<TaskCategory, RegExp[]> = {
  code: [
    /\b(code|function|debug|program|script|api|html|css|javascript|typescript|python|react|component|bug|error|compile|deploy)\b/i,
  ],
  reasoning: [
    /\b(explain|why|how does|analyze|compare|reason|logic|think|step by step|evaluate|assess|argument)\b/i,
  ],
  math: [
    /\b(calculate|math|equation|formula|solve|integral|derivative|algebra|geometry|statistic|probability|number)\b/i,
  ],
  research: [
    /\b(research|find|search|look up|investigate|what is|who is|when did|history|study|report|data|source)\b/i,
  ],
  creative: [
    /\b(write|story|poem|song|creative|imagine|fiction|narrative|dialogue|character|plot|lyric|rap|essay)\b/i,
  ],
  long_context: [
    /\b(summarize|entire|full|document|long|comprehensive|complete|all of|whole)\b/i,
  ],
  general: [], // Default fallback
};

export function classifyTask(message: string): TaskCategory {
  const scores: Record<TaskCategory, number> = {
    code: 0,
    reasoning: 0,
    math: 0,
    research: 0,
    creative: 0,
    long_context: 0,
    general: 0,
  };

  for (const [category, patterns] of Object.entries(TASK_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = message.match(pattern);
      if (matches) {
        scores[category as TaskCategory] += matches.length;
      }
    }
  }

  // Find highest scoring category
  let best: TaskCategory = "general";
  let bestScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = cat as TaskCategory;
    }
  }

  return best;
}

// ── Model Selection ─────────────────────────────────────────────────────────
export function selectModel(
  task: TaskCategory,
  preferredModelId?: string,
): ModelConfig {
  // If user picked a specific model, use it
  if (preferredModelId) {
    const found = MODEL_REGISTRY.find((m) => m.id === preferredModelId);
    if (found) return found;
  }

  // Auto-select: find models strong in this task, prefer Groq (faster)
  const candidates = MODEL_REGISTRY.filter(
    (m) => m.strengths.includes(task) && m.provider === "groq",
  );

  if (candidates.length > 0) {
    // Prefer the first match (ordered by priority in registry)
    return candidates[0];
  }

  // Fallback to general-purpose Groq model
  const groqFallback = MODEL_REGISTRY.find(
    (m) => m.id === "llama-3.3-70b",
  );
  return groqFallback || MODEL_REGISTRY[0];
}

// ── Build Fallback Chain ────────────────────────────────────────────────────
export function buildFallbackChain(primary: ModelConfig): ModelConfig[] {
  const chain = [primary];

  // Add other Groq models as fallbacks
  for (const m of MODEL_REGISTRY) {
    if (m.id !== primary.id && m.provider === "groq") {
      chain.push(m);
    }
  }

  // HuggingFace as last resort
  const hfModel = MODEL_REGISTRY.find((m) => m.provider === "huggingface");
  if (hfModel && hfModel.id !== primary.id) {
    chain.push(hfModel);
  }

  return chain;
}

// ── API Callers ─────────────────────────────────────────────────────────────
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(
  model: string,
  messages: { role: string; content: string }[],
  maxTokens: number,
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY not set");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq ${model} error: ${err}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content || "No response generated.";
}

async function callHuggingFace(
  model: string,
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
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (hfToken) headers.Authorization = `Bearer ${hfToken}`;

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 2048, temperature: 0.7, return_full_text: false },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF ${model} error: ${err}`);
  }

  const data = (await response.json()) as { generated_text: string }[];
  return data[0]?.generated_text?.trim() || "No response.";
}

// ── Main Router ─────────────────────────────────────────────────────────────
export async function routeAndChat(
  messages: { role: string; content: string }[],
  preferredModelId?: string,
): Promise<{ response: string; modelUsed: string; taskType: TaskCategory }> {
  // Classify the task from the last user message
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const task = lastUserMsg ? classifyTask(lastUserMsg.content) : "general";

  // Select primary model
  const primary = selectModel(task, preferredModelId);
  const chain = buildFallbackChain(primary);

  // Try each model in the fallback chain
  for (const model of chain) {
    try {
      let response: string;
      if (model.provider === "groq") {
        response = await callGroq(model.model, messages, model.maxTokens);
      } else {
        response = await callHuggingFace(model.model, messages);
      }
      return { response, modelUsed: model.id, taskType: task };
    } catch (err) {
      console.error(`Model ${model.id} failed:`, err);
      continue; // Try next in chain
    }
  }

  throw new Error("All models in fallback chain failed.");
}
