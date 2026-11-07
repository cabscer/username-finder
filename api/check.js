// Vercel serverless function: checks one Discord username server-side (avoids browser CORS).
const ENDPOINT = "https://discord.com/api/v9/unique-username/username-attempt-unauthed";

module.exports = async (req, res) => {
  const u = String(req.query.u || "").toLowerCase();
  if (!/^[a-z0-9_.]{2,3}$/.test(u) || u.includes("..")) {
    return res.status(400).json({ error: "Invalid username" });
  }
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
      },
      body: JSON.stringify({ username: u }),
    });
    const text = await r.text();
    let j = {};
    try { j = JSON.parse(text); } catch {}
    if (r.status === 429) return res.status(429).json({ retry_after: j.retry_after || 5 });
    if (!r.ok) return res.status(502).json({ error: "Discord returned " + r.status, detail: text.slice(0, 150) });
    return res.status(200).json({ taken: j.taken });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};
