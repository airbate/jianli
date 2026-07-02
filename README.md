# ATS Resume Match Checker

A dead-simple, free ATS keyword matching tool. Paste a job description + your resume text and get a match score, missing keywords, and rewrite suggestions in 30 seconds.

**Live demo**: [your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)

## Features

- ✅ No signup required
- ✅ No PDF uploads — just paste text
- ✅ Match score + missing keywords + rewrite suggestions
- ✅ 3 free analyses per day per IP
- ✅ Unlock 10 more free analyses with your email
- ✅ Mobile responsive
- ✅ Privacy-first: resume text is not stored

## Tech Stack

- Next.js 16 App Router
- Tailwind CSS + shadcn/ui
- SiliconFlow DeepSeek V3 (primary) + OpenAI gpt-4o-mini (fallback)
- Upstash Redis via Vercel Marketplace (with in-memory fallback for local dev)

## Local Development

```bash
cd ats-resume-match-checker
npm install
```

Copy `.env.example` to `.env.local` and add your keys:

```bash
SILICONFLOW_API_KEY=sk-...
OPENAI_API_KEY=sk-...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
CONTACT_EMAIL=hello@example.com
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Add the environment variables from `.env.example` in the Vercel dashboard.
4. Connect an Upstash Redis store from the Vercel Marketplace (Settings → Storage).
5. Deploy.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SILICONFLOW_API_KEY` | Yes | Primary LLM provider API key |
| `OPENAI_API_KEY` | Yes | Fallback LLM provider API key |
| `UPSTASH_REDIS_REST_URL` | No* | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | No* | Upstash Redis REST token |
| `CONTACT_EMAIL` | No | Shown on Privacy/Terms pages |

\* Not strictly required for local dev (falls back to in-memory storage), but required for production.

## API

### `POST /api/analyze`

Request:

```json
{
  "jobDescription": "string (max 15000 chars)",
  "resumeText": "string (max 10000 chars)",
  "jobTitle": "string (optional)",
  "email": "string (optional, unlocks bonus credits)"
}
```

Success response:

```json
{
  "matchScore": 72,
  "scoreLabel": "Good Match",
  "missingKeywords": ["Python", "AWS", "React"],
  "suggestedRewrites": [
    {
      "original": "I built web apps",
      "suggested": "Built React web apps deployed on AWS",
      "reason": "JD explicitly mentions React and AWS"
    }
  ],
  "summary": "Your resume covers..."
}
```

Error codes:

- `INVALID_INPUT` — request body failed validation
- `RATE_LIMITED` — too many requests from this IP
- `FREE_LIMIT_REACHED` — daily free quota exhausted
- `LLM_UNAVAILABLE` — both LLM providers failed
- `PARSE_ERROR` — could not parse LLM output

## Product Positioning

This is a **keyword gap checker**, not an AI resume writer. We highlight missing keywords between a JD and a resume; the user decides what to add.

## License

MIT
