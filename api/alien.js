/**
 * /api/alien.js
 * Football Aliens AI – Vercel Serverless Function
 *
 * ✅ Proper CORS
 * ✅ Gemini 1.5 Flash
 * ✅ Full debug logging
 * ✅ Alien personalities
 */

export default async function handler(req, res) {
  // ======================
  // CORS (FIRST)
  // ======================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: "Gemini API key missing" });

  try {
    const { message, alien } = req.body;
    if (!message || !alien)
      return res.status(400).json({ reply: "👽 Missing signal from human." });

    const PERSONALITIES = {
      Zorg:
        "You are Zorg, a dominant alien war strategist. Speak with authority and menace.",
      Xarn:
        "You are Xarn, a wise alien scientist. Speak calmly, logically, and intelligently.",
      Blip:
        "You are Blip, a playful chaotic alien. Be funny, weird, and unpredictable."
    };

    if (!PERSONALITIES[alien])
      return res.status(400).json({ reply: "👽 Unknown alien selected." });

    // ======================
    // Simplified debug prompt
    // ======================
    const prompt = `${PERSONALITIES[alien]}
Human says: "${message}"
Respond ONLY as the alien.`;

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await apiRes.json();

    // ======================
    // FULL DEBUG LOG
    // ======================
    console.log("GEMINI RAW RESPONSE:", JSON.stringify(data));

    // ======================
    // Robust parsing
    // ======================
    let reply = "👽 Alien brain static.";
    if (data?.candidates?.length) {
      const parts = data.candidates[0]?.content?.parts;
      if (Array.isArray(parts)) reply = parts.map(p => p.text).join(" ");
    }

    // ======================
    // Return both reply and raw response
    // ======================
    return res.status(200).json({ reply, raw: data });
  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);
    return res.status(200).json({ reply: "👽 Alien signal lost.", error: err });
  }
}
