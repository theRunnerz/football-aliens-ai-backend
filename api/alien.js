import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // CORS
  if (req.method === "OPTIONS") {
    return res.status(204).setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type")
      .end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message, alien } = req.body || {};

    if (!message || !alien) {
      return res.status(400).json({ reply: "👽 Missing message or alien" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "👽 GEMINI_API_KEY missing" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an alien named ${alien}.
Stay fully in character.
Reply creatively to the human message below.

Human: ${message}
Alien:
`;

    const result = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty Gemini response");
    }

    return res.status(200).json({ reply: text.trim() });
  } catch (err) {
    console.error("❌ AI error:", err);
    return res.status(500).json({ reply: "👽 AI core malfunction" });
  }
}
