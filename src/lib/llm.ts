import { OpenAI } from "openai";
import { buildAnalysisPrompt, REPAIR_PROMPT, SYSTEM_PROMPT } from "./prompts";
import { AnalyzeResponse, analyzeResponseSchema } from "./schemas";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callDeepSeek(
  jobDescription: string,
  resumeText: string,
  jobTitle?: string
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek API key not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildAnalysisPrompt(jobDescription, resumeText, jobTitle),
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } finally {
    clearTimeout(timeout);
  }
}

async function callSiliconFlow(
  jobDescription: string,
  resumeText: string,
  jobTitle?: string
): Promise<string> {
  if (!SILICONFLOW_API_KEY) {
    throw new Error("SiliconFlow API key not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-v3",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildAnalysisPrompt(jobDescription, resumeText, jobTitle),
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SiliconFlow HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenAI(
  jobDescription: string,
  resumeText: string,
  jobTitle?: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildAnalysisPrompt(jobDescription, resumeText, jobTitle),
      },
    ],
    temperature: 0.1,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  return response.choices[0].message.content || "";
}

function cleanJson(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseResult(raw: string): AnalyzeResponse {
  const cleaned = cleanJson(raw);
  const parsed = JSON.parse(cleaned);
  return analyzeResponseSchema.parse(parsed);
}

export async function analyzeWithLLM(
  jobDescription: string,
  resumeText: string,
  jobTitle?: string
): Promise<AnalyzeResponse> {
  let rawContent = "";
  let lastError: Error | null = null;

  // Try providers in order: DeepSeek → SiliconFlow → OpenAI
  const providers = [
    { name: "DeepSeek", call: () => callDeepSeek(jobDescription, resumeText, jobTitle) },
    { name: "SiliconFlow", call: () => callSiliconFlow(jobDescription, resumeText, jobTitle) },
    { name: "OpenAI", call: () => callOpenAI(jobDescription, resumeText, jobTitle) },
  ];

  for (const provider of providers) {
    try {
      rawContent = await provider.call();
      lastError = null;
      break;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`${provider.name} failed:`, lastError.message);
    }
  }

  if (lastError) {
    throw new Error("LLM_UNAVAILABLE");
  }

  try {
    return parseResult(rawContent);
  } catch (parseErr) {
    console.warn("Initial parse failed, attempting repair:", parseErr);

    // One repair attempt using any available provider
    try {
      let repairContent = "";
      for (const provider of providers) {
        try {
          repairContent = await provider.call();
          break;
        } catch {
          continue;
        }
      }
      return parseResult(repairContent);
    } catch (repairErr) {
      console.error("Repair parse failed:", repairErr);
      throw new Error("PARSE_ERROR");
    }
  }
}
