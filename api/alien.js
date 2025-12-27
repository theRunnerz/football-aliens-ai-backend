// File: /api/alien.js
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ reply: "Method not allowed" });

  const { message, alien } = req.body;

  if (!message || !alien) return res.json({ reply: "👽 Missing message or alien" });

  const validAliens = ["Zorg", "Xarn", "Blip"];
  if (!validAliens.includes(alien)) return res.json({ reply: "👽 Unknown alien selected." });

  // Ensure GEMINI_API_KEY is present
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing");
    return res.status(500).json({ reply: "👽 Server misconfigured: GEMINI_API_KEY missing" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are ${alien}, a quirky alien. Reply to the human message: "${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    if (!response || !response.text) {
      console.warn("⚠️ AI returned empty response");
      return res.json({ reply: "👽 Alien brain static…" });
    }

    return res.json({ reply: response.text });
  } catch (err) {
    console.error("❌ AI error:", err);
    return res.status(500).json({ reply: "👽 AI core malfunction" });
  }
}

