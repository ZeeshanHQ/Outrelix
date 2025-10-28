import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return json({ error: "url required" }, 400);
    }

    const resp = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html = await resp.text();
    const text = extractText(html);
    return json({ text, status: resp.status });
  } catch (e) {
    return json({ error: "fetch_failed", message: String(e) }, 500);
  }
});

function extractText(html: string): string {
  try {
    const noScript = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
    const bodyMatch = noScript.match(/<body[\s\S]*?<\/body>/i);
    const inBody = bodyMatch ? bodyMatch[0] : noScript;
    const text = inBody
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 50000);
  } catch {
    return html.slice(0, 20000);
  }
}

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

// Supabase Edge Function: Fetch Page Content
// This function fetches HTML from a URL and extracts visible text to avoid CORS issues

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://outrelix.vercel.app",
  "http://localhost:3000",
  "https://bfoggljxtwoloxthtocy.supabase.co",
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // Parse request
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate URL format
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Fetch the page HTML
    const fetchResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch: ${fetchResponse.statusText}`);
    }

    const html = await fetchResponse.text();

    // Extract visible text (simple implementation)
    const extractText = (html) => {
      // Remove script and style elements
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
      html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";

      // Extract visible text
      const text = html
        .replace(/<[^>]+>/g, " ") // Remove HTML tags
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

      // Extract meta description if available
      const descriptionMatch = html.match(
        /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
      );
      const description = descriptionMatch ? descriptionMatch[1] : "";

      // Extract keywords from meta tags
      const keywordsMatch = html.match(
        /<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i
      );
      const keywords = keywordsMatch ? keywordsMatch[1].split(",").map((k) => k.trim()) : [];

      return { title, text, description, keywords };
    };

    const extracted = extractText(html);

    return new Response(
      JSON.stringify({
        success: true,
        url,
        title: extracted.title,
        text: extracted.text.substring(0, 50000), // Limit text size
        description: extracted.description,
        keywords: extracted.keywords,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching page:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
