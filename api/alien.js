// /api/alien.js
export default async function handler(req, res) {
  // === Handle CORS preflight ===
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // === Only allow POST ===
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, alien } = req.body || {};

    if (!message || !alien) {
      return res.status(400).json({ reply: "👽 Missing alien or message" });
    }

    // === Example responses for aliens ===
    const alienResponses = {
      Blip: () => `Blip says: “That’s weird indeed!” 👽`,
      Xarn: () => `Xarn reports: “${message.split(" ").slice(0, 5).join(" ")}…” 🌌`,
      Zorg: () => `Zorg responds: “Intriguing, human.” 👾`,
    };

    const replyFn = alienResponses[alien] || (() => "👽 Unknown alien selected.");

    const reply = replyFn();

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ reply: "👽 Alien core malfunction" });
  }
}

