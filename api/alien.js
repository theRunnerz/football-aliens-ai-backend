export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST after preflight
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check Gemini key
  if (!process.env.GEMINI_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { message, alien } = req.body;

    if (!message || !alien) {
      return res.status(400).json({ reply: "👽 Missing signal data." });
    }

    const PERSONALITIES = {
      Zorg: "You are Zorg, a dominant alien war strategist. Speak with authority.",
      Xarn: "You are Xarn, a wise alien scientist. Speak calmly and analytically.",
      Blip: "You are Blip, a playful chaotic alien. Be funny and unpredictable."
    };

    const prompt = `
${PERSONALITIES[alien]}

Human says:
"${message}"
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "👽 Alien brain static.";

    res.status(200).json({ reply });

  } catch (err) {
    console.error("ALIEN CORE ERROR:", err);
    res.status(200).json({ reply: "👽 Alien signal lost." });
  }
}

