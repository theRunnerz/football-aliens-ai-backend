import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

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

  const prompt = `${PERSONALITIES[alien]}\nHuman says: "${message}"\nRespond ONLY as the alien.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", text: prompt }]
    });

    const reply = response?.candidates?.[0]?.content?.map(p => p.text).join(" ") || "👽 Alien brain static.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);
    return res.status(500).json({ reply: "👽 Alien signal lost." });
  }
}
