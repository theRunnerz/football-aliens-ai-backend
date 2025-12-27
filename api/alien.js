import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      return res.status(204).set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
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

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Alien ${alien} responds to: "${message}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return res.status(200).json({ reply: response?.text || "👽 Alien brain static…" });
  } catch (err) {
    console.error("❌ Serverless function error:", err);
    return res.status(500).json({ reply: "👽 AI core malfunction" });
  }
}
