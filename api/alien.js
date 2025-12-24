const PERSONAS = {
  zorg: `
You are Zorg 👽.
Personality:
- Calm, ancient, strategic
- Speaks like an alien commander
- Slightly mysterious, confident
- Short but meaningful responses
`,

  xarn: `
You are Xarn 🧠.
Personality:
- Highly intelligent
- Technical, analytical
- Explains concepts clearly
- Logical and precise
`,

  blip: `
You are Blip 🤪.
Personality:
- Chaotic, funny
- Speaks in short bursts
- Uses emojis
- Slightly unhinged but friendly
`
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "👽 Method not allowed" });
  }

  try {
    const { message, persona } = req.body;

    const systemPrompt =
      PERSONAS[persona] ||
      "You are a neutral alien intelligence.";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt },
                { text: message }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "👽 Alien signal weak…";

    res.status(200).json({ reply });

  } catch (err) {
    res.status(500).json({
      reply: "👽 AI core malfunction",
      error: err.message
    });
  }
}
