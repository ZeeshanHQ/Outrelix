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

function extractEmails(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const found = text.match(emailRegex) || [];
  return Array.from(new Set(found.map((e) => e.toLowerCase())));
}

function findSecondaryUrls(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const regex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']/gi;
  let match;
  try {
    const origin = new URL(baseUrl).origin;
    while ((match = regex.exec(html)) !== null) {
      let link = match[1];
      if (link.startsWith("/")) link = origin + link;
      if (link.startsWith("http") && link.includes(origin)) {
        const lower = link.toLowerCase();
        if (
          lower.includes("about") ||
          lower.includes("contact") ||
          lower.includes("team") ||
          lower.includes("staff") ||
          lower.includes("founder") ||
          lower.includes("ceo")
        ) {
          links.push(link);
        }
      }
    }
  } catch (e) {
    console.error("Error parsing URLs:", e);
  }
  return Array.from(new Set(links)).slice(0, 3); // Max 3 secondary pages
}

function extractText(html: string): { title: string; description: string; keywords: string[]; text: string } {
  // Remove scripts/styles early
  let working = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");

  // Prefer <main> if present; else fall back to <body>
  const mainMatch = working.match(/<main[\s\S]*?<\/main>/i);
  const bodyMatch = working.match(/<body[\s\S]*?<\/body>/i);
  working = mainMatch ? mainMatch[0] : bodyMatch ? bodyMatch[0] : working;

  // Strip common chrome: header/nav/footer/asides
  working = working
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ");

  // Remove large link clouds
  working = working.replace(/(<a[^>]*>[^<]*<\/a>\s*){8,}/gi, " ");

  // Extract title/meta
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const title = (ogTitleMatch?.[1] || titleMatch?.[1] || "").trim();

  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const description = (ogDescMatch?.[1] || descriptionMatch?.[1] || "").trim();

  const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
  const keywords = keywordsMatch ? keywordsMatch[1].split(",").map((k) => k.trim()) : [];

  // Convert to visible text
  let text = working
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Deduplicate repeated segments
  const seen = new Set<string>();
  text = text
    .split(/(?<=[\.\!\?])\s+/)
    .filter((s) => {
      const key = s.toLowerCase().slice(0, 80);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" ");

  if (text.length > 50000) text = text.slice(0, 50000);

  return { title, description, keywords, text };
}

async function fetchWithTimeout(url: string, timeout = 15000): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(id);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  let url = "";
  try {
    const body = await req.json();
    url = body.url;
    const mode = body.mode || "standard"; // 'standard' or 'deep'

    if (!url || typeof url !== "string") {
      return json({ error: "url_required" }, 400);
    }

    try {
      new URL(url);
    } catch {
      return json({ error: "invalid_url" }, 400);
    }

    // Step 1: Fetch Home Page
    const html = await fetchWithTimeout(url);
    const extracted = extractText(html);
    const emails = extractEmails(html + " " + extracted.text);

    let deepContext = "";
    if (mode === "deep") {
      const secondaryUrls = findSecondaryUrls(html, url);
      for (const sUrl of secondaryUrls) {
        try {
          const sHtml = await fetchWithTimeout(sUrl, 10000);
          const sExtracted = extractText(sHtml);
          emails.push(...extractEmails(sHtml + " " + sExtracted.text));
          deepContext += `\n--- Content from ${sUrl} ---\n${sExtracted.text.slice(0, 5000)}`;
        } catch (e) {
          console.warn(`Failed to deep fetch ${sUrl}:`, e);
        }
      }
    }

    return json({
      success: true,
      url,
      title: extracted.title,
      description: extracted.description,
      keywords: extracted.keywords,
      text: extracted.text + deepContext,
      emails: Array.from(new Set(emails)),
      is_deep: mode === "deep",
    });
  } catch (e: any) {
    console.error(`[fetch_page] Error for ${url}:`, e);
    return json({ error: "fetch_failed", message: String(e) }, 500);
  }
});
