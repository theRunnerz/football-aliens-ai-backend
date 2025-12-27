/**
 * /api/alien.js
 * Football Aliens AI – Vercel Serverless Function (Gemini 3 Pro Preview)
 *
 * ✅ Proper CORS (POST + OPTIONS)
 * ✅ Uses @google/genai SDK
 * ✅ Bulletproof response parsing
 * ✅ Alien personalities
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const PERSONALITIES = {
  Zorg: "You are Zorg, a dominant alien war strategist. Speak with authority and menace.",
  Xarn: "You are Xarn, a wise alien scientist. Speak calmly, logically, and intelligently.",
  Blip: "You are Blip, a playful chaotic alien. Be funny, weird, and unpredictable.",
};

export default async function handler(req, res) {
  // ======================
  // CORS (FIRST)
  // ======================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key missing" });
  }

  try {
    const { message, alien } = req.body;

    if (!message || !alien) {
      return res.status(400).json({ reply: "👽 Missing signal from human." });
    }

    if (!PERSONALITIES[alien]) {
      return res.status(400).json({ reply: "👽 Unknown alien selected." });
    }

    const prompt = `${PERSONALITIES[alien]}
Human says: "${message}"
Respond ONLY as the alien.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // 🔍 Robust response parsing
    let reply = "👽 Alien brain static.";
    if (response?.candidates?.length) {
      const parts = response.candidates[0].content.parts;
      if (Array.isArray(parts)) {
        reply = parts.map(p => p.text).join(" ");
      }
    }

    return res.status(200).json({ reply, raw: response });
  } catch (err) {
    console.error("👽 ALIEN CORE ERROR:", err);
    return res.status(200).json({ reply: "👽 Alien signal lost." });
  }
}
