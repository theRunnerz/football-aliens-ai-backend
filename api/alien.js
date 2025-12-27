// File: /api/alien.js
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    // CORS preflight
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  const { message, alien } = req.body;

  // Validate inputs
  if (!message || !alien) {
    return res.json({ reply: "👽 Missing message or alien" });
  }

  const validAliens = ["Zorg", "Xarn", "Blip"];
  if (!validAliens.includes(alien)) {
    return res.json({ reply: "👽 Unknown alien selected." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are ${alien}, a quirky alien. Reply to the human message: "${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Send AI-generated response
    return res.json({ reply: response.text });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({ reply: "👽 AI core malfunction" });
  }
}

