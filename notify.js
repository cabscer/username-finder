// Vercel serverless function: posts to your webhook. The URL lives in the WEBHOOK_URL
// environment variable, so it never appears in your public site or GitHub repo.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const url = process.env.WEBHOOK_URL;
  if (!url) return res.status(500).json({ error: "WEBHOOK_URL is not set in Vercel" });
  const content = String((req.body && req.body.content) || "").slice(0, 1900);
  if (!content) return res.status(400).json({ error: "Empty message" });
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, username: "Username Checker" }),
    });
    if (r.status === 429) {
      const j = await r.json().catch(() => ({}));
      return res.status(429).json({ retry_after: j.retry_after || 2 });
    }
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
