import express from "express";
import fetch from "node-fetch";

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

// ✅ CORS FIX (GitHub Pages → Vercel)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    alien: "online 👽",
    time: new Date().toISOString()
  });
});

/* =========================
   ALIEN AI ENDPOINT
========================= */

app.post("/api/alien", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({
        reply: "👽 No signal received from human"
      });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error("Gemini API error");
    }

    const data = await geminiResponse.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "👽 Alien signal lost… try again";

    res.json({ reply });

  } catch (error) {
    console.error("ALIEN AI ERROR:", error);
    res.status(500).json({
      reply: "👽 Alien signal lost… AI transmission failed"
    });
  }
});

/* =========================
   EXPORT FOR VERCEL
========================= */

export default app;
