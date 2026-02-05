import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const { messages, model = "meta-llama/llama-3.3-8b-instruct:free", temperature = 0.7, max_tokens } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "messages[] required" }, 400);
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) return json({ error: "OPENROUTER_API_KEY not configured" }, 500);

    const siteUrl = Deno.env.get("OPENROUTER_SITE_URL") || "https://outrelix.vercel.app";
    const siteName = Deno.env.get("OPENROUTER_SITE_NAME") || "Outrelix";

    const resp = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const data = await resp.json();
    if (!resp.ok) return json({ error: data?.error || "openrouter_error", data }, resp.status);

    const content = data?.choices?.[0]?.message?.content || "";
    return json({ content, raw: data });
  } catch (e) {
    return json({ error: "server_error", message: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), "Content-Type": "application/json" } });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}



