import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export async function generateScript(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { prompt, mode } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, message: "Prompt is required" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(200).json({
        success: true,
        text: "VoiceNova System Message:\n\nGEMINI_API_KEY is missing in your backend environment variables.\n\nPlease add a valid Gemini API key to use the real AI Script Writer. Until then, this is a mock response to test the UI flow for your prompt:\n\n'" + prompt + "'",
        isMock: true
      });
      return;
    }

    // Call real Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: mode === "chat" ? "You are Nova, the AI assistant for VoiceNova SaaS. Be helpful, concise, and friendly. Answer the user: " + prompt : "You are an expert script writer for VoiceNova, a premium AI voice generation SaaS. Write a script based on this user prompt: " + prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      logger.error("Gemini API Error: " + errData);
      res.status(502).json({ success: false, message: "Failed to generate script from AI provider." });
      return;
    }

    const data = await response.json() as any;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No text generated.";

    res.status(200).json({
      success: true,
      text: generatedText,
      isMock: false
    });
  } catch (error) {
    next(error);
  }
}


