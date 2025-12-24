export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  const { message, alien } = req.body;

  if (!message || !alien) {
    return res.status(400).json({ reply: "Missing message or alien" });
  }

  const personalities = {
    Zorg: "a grumpy football-obsessed alien commander. Short, tactical, sarcastic.",
    Blip: "an energetic, meme-loving alien who jokes constantly.",
    Xarn: "a calm, ancient alien strategist who speaks cryptically."
  };

  const prompt = `
You are ${alien}, ${personalities[alien]}.
User says: "${message}"
Reply in character.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "👽 Alien signal lost.";

    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ reply: "👽 AI core malfunction." });
  }
}
