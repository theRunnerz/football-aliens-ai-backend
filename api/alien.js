/**
 * Football Aliens AI Backend
 * Fully CORS-safe for GitHub Pages front end
 * Supports Gemini 3 and 3 alien personalities
 */

export default async function handler(req, res) {
  // ✅ Always send CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST requests allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check Gemini API key
  if (!process.env.GEMINI_API_KEY) {
    return res.status(401).json({ error: "Unauthorized — API key missing" });
  }

  try {
    const { message, alien } = req.body;

    if (!message || !alien) {
      return res.status(400).json({ reply: "👽 Missing signal from human." });
    }

    // Define alien personalities
    const PERSONALITIES = {
      Zorg: "You are Zorg, a dominant alien war strategist. Speak with authority.",
      Xarn: "You are Xarn, a wise alien scientist. Speak calmly and analytically.",
      Blip: "You are Blip, a playful chaotic alien. Be funny and unpredictable."
    };

    if (!PERSONALITIES[alien]) {
      return res.status(400).json({ reply: "👽 Unknown alien selected." });
    }

    // Build Gemini prompt
    const prompt = `${PERSONALITIES[alien]}\nHuman says: "${message}"`;

    // Call Gemini 3 API
    const apiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-3:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          prompt,
          maxOutputTokens: 150
        })
      }
    );

    const data = await apiRes.json();

    // Parse response safely
    const reply =
      data?.candidates?.[0]?.content?.[0]?.text || "👽 Alien brain static.";

    // ✅ Return reply with CORS headers still intact
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);

    // Always respond with headers to prevent CORS blocking
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ reply: "👽 Alien signal lost." });
  }
}
