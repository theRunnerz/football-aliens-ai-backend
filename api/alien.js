/**
 * /api/alien.js
 * Football Aliens AI – Vercel Serverless Function
 *
 * ✅ Proper CORS
 * ✅ Gemini 1.5 Flash
 * ✅ Safety-aware parsing
 * ✅ Personality fallback replies
 */

export default async function handler(req, res) {
  // ======================
  // CORS
  // ======================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
        "You are Zorg, a dominant alien war strategist. Respond confidently, clearly, and without threats.",
      Xarn:
        "You are Xarn, a wise alien scientist. Respond thoughtfully, friendly, and informative.",
      Blip:
        "You are Blip, a playful alien. Be funny, weird, and lighthearted."
    };

    const FALLBACKS = {
      Zorg: "Zorg acknowledges your presence.",
      Xarn: "Greetings, human. I am Xarn.",
      Blip: "Blip says hi! 👽✨"
    };

    if (!PERSONALITIES[alien]) {
      return res.status(400).json({ reply: "👽 Unknown alien selected." });
    }

    // 🔑 Gemini-friendly prompt (less likely to trigger safety)
    const prompt = `
${PERSONALITIES[alien]}
Reply naturally in character.

Human message:
${message}
`;

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

    console.log("🧠 GEMINI RAW:", JSON.stringify(data));

    let reply = FALLBACKS[alien];

    // ✅ Success path
    if (
      data?.candidates?.length &&
      data.candidates[0]?.content?.parts?.length
    ) {
      const text = data.candidates[0].content.parts
        .map(p => p.text)
        .join(" ")
        .trim();

      if (text) {
        reply = text;
      }
    }

    // 🚨 Safety blocked
    if (data?.promptFeedback?.blockReason) {
      console.warn("⚠️ Gemini blocked response:", data.promptFeedback);
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);
    return res.status(200).json({ reply: "👽 Alien signal lost." });
  }
}
