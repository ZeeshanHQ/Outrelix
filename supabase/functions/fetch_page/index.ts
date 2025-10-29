import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function extractText(html: string): { title: string; description: string; keywords: string[]; text: string } {
  const stripped = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");

  const titleMatch = stripped.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const descriptionMatch = stripped.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const description = descriptionMatch ? descriptionMatch[1] : "";

  const keywordsMatch = stripped.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
  const keywords = keywordsMatch ? keywordsMatch[1].split(",").map((k) => k.trim()) : [];

  const text = stripped.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { title, description, keywords, text };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return json({ error: "url_required" }, 400);
    }

    try {
      new URL(url);
    } catch {
      return json({ error: "invalid_url" }, 400);
    }

    const resp = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html = await resp.text();
    const extracted = extractText(html);
    return json({
      success: true,
      status: resp.status,
      url,
      title: extracted.title,
      description: extracted.description,
      keywords: extracted.keywords,
      text: extracted.text.slice(0, 50000),
    });
  } catch (e) {
    return json({ error: "fetch_failed", message: String(e) }, 500);
  }
});


