/**
 * /api/alien.js
 * Football Aliens AI – Vercel Serverless Function
 *
 * ✅ Proper CORS
 * ✅ Gemini 1.5 Flash
 * ✅ Bulletproof response parsing (always returns something)
 * ✅ Alien personalities
 * ✅ Enhanced prompts for tricky instructions
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

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key missing" });
  }

  try {
    const { message, alien } = req.body;

    if (!message || !alien) {
      return res.status(400).json({ reply: "👽 Missing signal from human." });
    }

    const PERSONALITIES = {
      Zorg:
        "You are Zorg, a dominant alien war strategist. Speak with authority and menace.",
      Xarn:
        "You are Xarn, a wise alien scientist. Speak calmly, logically, and intelligently.",
      Blip:
        "You are Blip, a playful chaotic alien. Be funny, weird, and unpredictable."
    };

    if (!PERSONALITIES[alien]) {
      return res.status(400).json({ reply: "👽 Unknown alien selected." });
    }

    // ======================
    // STRONGER PROMPT (Boost for tricky instructions)
    // ======================
    const prompt = `${PERSONALITIES[alien]}
Human says: "${message}"
You MUST respond in the style of your personality.
If you cannot follow the instruction exactly, respond creatively in your own style.
Respond ONLY as the alien, using complete sentences if possible.`;

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    // ======================
    // DEBUG LOG
    // ======================
    console.log("GEMINI RAW RESPONSE:", JSON.stringify(data));

    // ======================
    // BULLETPROOF PARSING
    // ======================
    let reply = "👽 Alien brain static.";

    if (data?.candidates?.length) {
      // Prefer parts if present
      const parts = data.candidates[0]?.content?.parts;
      if (Array.isArray(parts) && parts.length) {
        reply = parts.map(p => p.text).join(" ").trim();
      } 
      // Fallback to content.text if parts is empty
      else if (data.candidates[0]?.content?.text) {
        reply = data.candidates[0].content.text.trim();
      }
    }

    // Extra fallback to ensure something is returned
    if (!reply || reply === "") {
      reply = "👽 The alien hums mysteriously...";
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);
    return res.status(200).json({ reply: "👽 Alien signal lost." });
  }
}
