/**
 * /api/alien.js
 * Football Aliens AI backend
 * Gemini 3 integration + 3 personalities + CORS for GitHub Pages
 */

export default async function handler(req, res) {
  // ✅ Allow requests from GitHub Pages
  const allowedOrigin = "https://therunnerz.github.io";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.GEMINI_API_KEY) return res.status(401).json({ error: "Unauthorized — API key missing" });

  try {
    const { message, alien } = req.body;

    if (!message || !alien) return res.status(400).json({ reply: "👽 Missing signal from human." });

    const PERSONALITIES = {
      Zorg: "You are Zorg, a dominant alien war strategist. Speak with authority.",
      Xarn: "You are Xarn, a wise alien scientist. Speak calmly and analytically.",
      Blip: "You are Blip, a playful chaotic alien. Be funny and unpredictable."
    };

    if (!PERSONALITIES[alien]) return res.status(400).json({ reply: "👽 Unknown alien selected." });

    const prompt = `${PERSONALITIES[alien]}\nHuman says: "${message}"`;

    const apiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-3:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          prompt: prompt,
          maxOutputTokens: 150
        })
      }
    );

    const data = await apiRes.json();

    const reply = data?.candidates?.[0]?.content?.[0]?.text || "👽 Alien brain static.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);
    res.status(200).json({ reply: "👽 Alien signal lost." });
  }
}
