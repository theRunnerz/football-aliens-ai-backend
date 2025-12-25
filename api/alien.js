export default async function handler(req, res) {
  /* ======================
     CORS — MUST BE FIRST
  ====================== */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, alien } = req.body || {};

    if (!message || !alien) {
      return res.status(400).json({
        reply: "👽 Missing signal from human."
      });
    }

    /* ======================
       Alien personalities
    ====================== */
    const PERSONALITIES = {
      Zorg: "You are Zorg, a dominant alien war strategist. Speak with authority.",
      Xarn: "You are Xarn, a wise alien scientist. Speak calmly and analytically.",
      Blip: "You are Blip, a playful chaotic alien. Be funny and unpredictable."
    };

    if (!PERSONALITIES[alien]) {
      return res.status(400).json({
        reply: "👽 Unknown alien selected."
      });
    }

    /* ======================
       Gemini 1.5 API (CORRECT)
    ====================== */
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${PERSONALITIES[alien]}\nHuman says: "${message}"`
                }
              ]
            }
          ]
        })
      }
    );

    const geminiData = await geminiRes.json();

    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "👽 Alien brain static.";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);
    return res.status(200).json({
      reply: "👽 Alien signal lost."
    });
  }
}
