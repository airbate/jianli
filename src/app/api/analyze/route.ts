import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { analyzeRequestSchema, AnalyzeResponse, ApiErrorResponse } from "@/lib/schemas";
import { analyzeWithLLM } from "@/lib/llm";
import {
  checkRateLimit,
  consumeQuota,
  getCachedResult,
  getRemainingQuota,
  grantBonusCredits,
  setCachedResult,
  BONUS_CREDITS,
} from "@/lib/quota";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

function jsonResponse(data: AnalyzeResponse | ApiErrorResponse, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(req);

    // Rate limiting
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return jsonResponse(
        {
          error: "RATE_LIMITED",
          message: `Too many requests. Please try again in ${rateLimit.retryAfter || 60} seconds.`,
        },
        429
      );
    }

    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        { error: "INVALID_INPUT", message: "Invalid JSON body" },
        400
      );
    }

    const parseResult = analyzeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const message = parseResult.error.issues
        .map((e) => `${String(e.path)}: ${e.message}`)
        .join("; ");
      return jsonResponse(
        { error: "INVALID_INPUT", message },
        400
      );
    }

    const { jobDescription, resumeText, jobTitle, email } = parseResult.data;

    // Quota check
    const remaining = await getRemainingQuota(ip, email);
    if (remaining <= 0) {
      return jsonResponse(
        {
          error: "FREE_LIMIT_REACHED",
          message: "You've used your 3 free checks today. Leave your email for 10 more free analyses.",
        },
        403
      );
    }

    // Cache check
    const cacheHash = createHash("sha256")
      .update(`${jobDescription.trim().toLowerCase()}::${resumeText.trim().toLowerCase()}`)
      .digest("hex");
    const cached = await getCachedResult(cacheHash);
    if (cached) {
      return jsonResponse(cached as AnalyzeResponse);
    }

    // If user provided email and free quota is exhausted, grant bonus credits
    if (email && remaining <= BONUS_CREDITS) {
      await grantBonusCredits(email, ip);
    }

    // Consume quota before LLM call to prevent abuse
    await consumeQuota(ip, email);

    // Call LLM
    let result: AnalyzeResponse;
    try {
      result = await analyzeWithLLM(jobDescription, resumeText, jobTitle);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage === "LLM_UNAVAILABLE") {
        return jsonResponse(
          {
            error: "LLM_UNAVAILABLE",
            message: "Our analysis service is temporarily unavailable. Please try again in a moment.",
          },
          503
        );
      }
      return jsonResponse(
        {
          error: "PARSE_ERROR",
          message: "We couldn't parse the analysis result. Please try again.",
        },
        500
      );
    }

    // Cache result
    await setCachedResult(cacheHash, result);

    return jsonResponse(result);
  } catch (err) {
    console.error("Unexpected error in /api/analyze:", err);
    return jsonResponse(
      {
        error: "LLM_UNAVAILABLE",
        message: "Something went wrong. Please try again.",
      },
      500
    );
  }
}
