/**
 * /api/alien.js
 * Football Aliens AI – Vercel Serverless Function
 * ✅ Proper CORS
 * ✅ Gemini 1.5 Pro (correct API usage)
 * ✅ Alien personalities
 */

export default async function handler(req, res) {
  /* ======================
     CORS HEADERS (FIRST)
  ====================== */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Ensure API key exists
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key missing" });
  }

  try {
    const { message, alien } = req.body;

    if (!message || !alien) {
      return res
        .status(400)
        .json({ reply: "👽 Missing signal from human." });
    }

    /* ======================
       Alien personalities
    ====================== */
    const PERSONALITIES = {
      Zorg:
        "You are Zorg, a dominant alien war strategist. Speak with authority, confidence, and intimidation.",
      Xarn:
        "You are Xarn, a wise alien scientist. Speak calmly, analytically, and with deep intelligence.",
      Blip:
        "You are Blip, a playful chaotic alien. Be funny, unpredictable, and slightly mischievous."
    };

    if (!PERSONALITIES[alien]) {
      return res
        .status(400)
        .json({ reply: "👽 Unknown alien selected." });
    }

    const prompt = `${PERSONALITIES[alien]}
Human says: "${message}"
Respond as the alien.`;

    /* ======================
       Gemini API Call
       ⚠️ API KEY IN URL
    ====================== */
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await apiRes.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "👽 Alien brain static.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);
    return res.status(200).json({ reply: "👽 Alien signal lost." });
  }
}
