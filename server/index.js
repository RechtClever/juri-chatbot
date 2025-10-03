import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const app = express();
app.use(express.json());

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

app.post("/api/claude", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-2.1",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("Claude LLM server running on port 3001");
});
