import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(204).set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  const { message, alien } = req.body || {};

  if (!message || !alien) {
    return res.status(400).json({ reply: "👽 Missing message or alien" });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing");
    return res.status(500).json({ reply: "👽 AI core offline: API key missing" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Alien ${alien} responds to: "${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const replyText = response?.text?.trim() || "👽 Alien brain static…";

    return res.status(200).json({ reply: replyText });
  } catch (err) {
    console.error("❌ AI generation failed:", err);
    return res.status(500).json({ reply: "👽 AI core malfunction" });
  }
}

