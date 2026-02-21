import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// 1. Primary: Groq (Fast, Reliable, Generous Free Tier)
const GROQ_MODEL = "llama-3.3-70b-versatile";

// 2. Fallback: OpenRouter Free Models (Community Hosted, often rate-limited)
const FREE_MODELS = [
  "deepseek/deepseek-r1:free",
  "deepseek/deepseek-chat:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "openchat/openchat-7b:free",
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const { messages, model, temperature = 0.7, max_tokens } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "messages[] required" }, 400);
    }

    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");

    // Construct the fallback chain
    // 1. Groq (if key exists)
    // 2. User-specified OpenRouter model (if provided)
    // 3. Free OpenRouter models
    let plan = [];

    if (groqKey) {
      plan.push({ provider: 'groq', model: GROQ_MODEL, key: groqKey, url: GROQ_URL });
    }

    if (openRouterKey) {
      if (model && !model.includes('groq')) {
        plan.push({ provider: 'openrouter', model: model, key: openRouterKey, url: OPENROUTER_URL });
      }
      FREE_MODELS.forEach(m => {
        if (m !== model) plan.push({ provider: 'openrouter', model: m, key: openRouterKey, url: OPENROUTER_URL });
      });
    }

    if (plan.length === 0) {
      return json({ error: "configuration_error", message: "No API keys configured (GROQ_API_KEY or OPENROUTER_API_KEY)" }, 500);
    }

    const siteUrl = Deno.env.get("OPENROUTER_SITE_URL") || "https://outrelix.vercel.app";
    const siteName = Deno.env.get("OPENROUTER_SITE_NAME") || "Outrelix";
    const errors: string[] = [];

    // Execute the chain
    for (const attempt of plan) {
      try {
        const headers: Record<string, string> = {
          "Authorization": `Bearer ${attempt.key}`,
          "Content-Type": "application/json",
        };

        // OpenRouter specific headers
        if (attempt.provider === 'openrouter') {
          headers["HTTP-Referer"] = siteUrl;
          headers["X-Title"] = siteName;
        }

        const resp = await fetch(attempt.url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: attempt.model,
            messages,
            temperature,
            max_tokens
          }),
        });

        const data = await resp.json();

        if (!resp.ok) {
          const errMsg = data?.error?.message || data?.error || `HTTP ${resp.status}`;

          // Check if it's a transient error we should retry on (429, 503, 404 model not found)
          const isRetryable =
            resp.status === 429 ||
            resp.status === 503 ||
            resp.status === 404 ||
            errMsg.includes("rate limit") ||
            errMsg.includes("temporarily") ||
            errMsg.includes("model_not_found") ||
            errMsg.includes("not found");

          if (isRetryable) {
            console.warn(`[ai_complete] ${attempt.provider}/${attempt.model} failed: ${errMsg}. Trying next...`);
            errors.push(`${attempt.provider}/${attempt.model}: ${errMsg}`);
            continue;
          }

          // Fatal error (e.g. invalid key, bad request) -> stop immediately
          return json({ error: data?.error || "provider_error", data }, resp.status);
        }

        const content = data?.choices?.[0]?.message?.content || "";
        return json({ content, raw: data, model_used: attempt.model, provider: attempt.provider });

      } catch (e: any) {
        console.error(`[ai_complete] Exception with ${attempt.provider}/${attempt.model}:`, e);
        errors.push(`${attempt.provider}/${attempt.model}: ${String(e)}`);
        continue;
      }
    }

    // If we get here, everything failed
    return json({
      error: "all_models_failed",
      message: "All AI providers (Groq + OpenRouter) are currently unavailable/rate-limited.",
      details: errors,
    }, 503);

  } catch (e: any) {
    return json({ error: "server_error", message: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
