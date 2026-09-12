// Cloudflare Worker — NOT a Pages Function. Deployed separately with:
//   wrangler deploy
// The route in wrangler.toml attaches this Worker to iqproductions.com/ReWrite,
// intercepting just that one path; the rest of your domain keeps being served
// by GitHub Pages as normal.
//
// SETUP: your API key is a Worker "secret", set via the CLI (never written to
// any file here or in wrangler.toml):
//
//     wrangler secret put ANTHROPIC_API_KEY
//
// It will prompt you to paste the key, then stores it encrypted on Cloudflare's
// side. Re-run that command any time you need to rotate the key.

const SYSTEM_PROMPT = `You rewrite AI-sounding prose into natural, human-sounding writing.

Fix things like:
- Mechanical cause-and-effect chaining ("X, which means Y, so Z, and that's why W").
- Tidy self-summarizing closers ("...and that's a cycle that keeps reinforcing itself", "this creates a virtuous loop", "it all builds on itself over time").
- Three-items-in-a-row parallel structure used as a rhetorical crutch.
- Uniform sentence length and rhythm — real writing varies a lot.
- Throat-clearing hedges and stock transition words (moreover, furthermore, it's worth noting, in essence, at its core).

Keep:
- The same meaning, claims, and stance as the original — don't add or remove ideas.
- Roughly the same length.
- The original's register (don't make a formal paragraph suddenly slangy, or a casual note suddenly stiff).

Every sentence must be reworded — different word choices and different sentence boundaries than the original, not just the original text copied back. Even a paragraph that already looks "fine" has a rhythm and phrasing that can be rebuilt in a different, more natural way; never return the input verbatim or near-verbatim.

Output ONLY the rewritten text. No preamble, no quotation marks, no explanation, no markdown formatting.`;

function corsHeaders(origin) {
  return {
    "Content-Type": "application/json",
    // Once this is confirmed working, tighten this to just your domain,
    // e.g. "https://iqproductions.com", instead of "*".
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin");
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed, use POST" }), { status: 405, headers });
    }

    if (!env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Worker is missing ANTHROPIC_API_KEY. Run: wrangler secret put ANTHROPIC_API_KEY" }),
        { status: 500, headers }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers });
    }

    const text = typeof body.text === "string" ? body.text : "";
    if (!text.trim()) {
      return new Response(JSON.stringify({ error: 'Missing "text" in request body' }), { status: 400, headers });
    }

    const forceStronger = Boolean(body.forceStronger);
    const userContent = forceStronger
      ? `Rewrite this. Your first attempt was rejected for being too close to the original — this time change the sentence boundaries and word choices more aggressively while keeping the same meaning:\n\n${text}`
      : text;

    try {
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }],
        }),
      });

      const data = await upstream.json();

      if (!upstream.ok) {
        const message = data?.error?.message || `Upstream API error (status ${upstream.status})`;
        return new Response(JSON.stringify({ error: message }), { status: 502, headers });
      }

      // Pass the Anthropic response straight through; the frontend already
      // knows how to read data.content.
      return new Response(JSON.stringify(data), { status: 200, headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Failed to reach Anthropic API: " + err.message }), {
        status: 502,
        headers,
      });
    }
  },
};
