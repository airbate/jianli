import { OpenAI } from "openai";
import { buildAnalysisPrompt, REPAIR_PROMPT, SYSTEM_PROMPT } from "./prompts";
import { AnalyzeResponse, analyzeResponseSchema } from "./schemas";

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callSiliconFlow(
  jobDescription: string,
  resumeText: string,
  jobTitle?: string
): Promise<string> {
  if (!SILICONFLOW_API_KEY) {
    throw new Error("SiliconFlow API key not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

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
      throw new Error(`SiliconFlow HTTP ${response.status}`);
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
  let usedFallback = false;

  try {
    rawContent = await callSiliconFlow(jobDescription, resumeText, jobTitle);
  } catch (err) {
    console.warn("SiliconFlow failed, falling back to OpenAI:", err);
    rawContent = await callOpenAI(jobDescription, resumeText, jobTitle);
    usedFallback = true;
  }

  try {
    return parseResult(rawContent);
  } catch (parseErr) {
    console.warn("Initial parse failed, attempting repair:", parseErr);

    // One repair attempt
    try {
      const repairClient = new OpenAI({ apiKey: OPENAI_API_KEY || "" });
      const repairResponse = await repairClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: buildAnalysisPrompt(jobDescription, resumeText, jobTitle),
          },
          {
            role: "assistant",
            content: rawContent,
          },
          { role: "user", content: REPAIR_PROMPT },
        ],
        temperature: 0,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const repairContent = repairResponse.choices[0].message.content || "";
      return parseResult(repairContent);
    } catch (repairErr) {
      console.error("Repair parse failed:", repairErr);
      throw new Error(
        usedFallback
          ? "LLM_UNAVAILABLE"
          : "PARSE_ERROR"
      );
    }
  }
}
