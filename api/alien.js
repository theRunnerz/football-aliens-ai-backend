import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, alien } = req.body;
  if (!message || !alien) return res.status(400).json({ reply: "👽 Missing signal from human." });

  const PERSONALITIES = {
    Zorg: "You are Zorg, a dominant alien war strategist. Speak with authority and menace.",
    Xarn: "You are Xarn, a wise alien scientist. Speak calmly, logically, and intelligently.",
    Blip: "You are Blip, a playful chaotic alien. Be funny, weird, and unpredictable."
  };

  if (!PERSONALITIES[alien]) return res.status(400).json({ reply: "👽 Unknown alien selected." });

  try {
    const prompt = `${PERSONALITIES[alien]}\nHuman says: "${message}"\nRespond ONLY as the alien.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt
    });

    const reply = response?.text || "👽 Alien brain static.";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);
    return res.status(500).json({ reply: "👽 Alien signal lost." });
  }
}
