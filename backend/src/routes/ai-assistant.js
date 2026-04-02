const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();

let googleGenAI;
try {
  const { GoogleGenAI } = require("@google/genai");
  googleGenAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
} catch (err) {
  console.warn("Gemini SDK initialization warning:", err.message);
}

function mapGeminiError(error) {
  const message = error?.message || String(error);

  if (message.includes("401") || message.includes("unauthorized")) {
    return {
      statusCode: 401,
      message: "Authentication failed. Please verify GEMINI_API_KEY.",
    };
  }

  if (message.includes("429") || message.includes("rate limit")) {
    return {
      statusCode: 429,
      message: "Too many AI requests. Please wait a moment and try again.",
    };
  }

  if (message.includes("400") || message.includes("invalid")) {
    return {
      statusCode: 400,
      message: "Invalid request. Please check your message format.",
    };
  }

  if (message.includes("500") || message.includes("server")) {
    return {
      statusCode: 502,
      message: "Gemini server error. Please retry shortly.",
    };
  }

  return {
    statusCode: 500,
    message: "Failed to get AI response",
  };
}

router.post("/chat", requireAuth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return errorResponse(res, "Message is required", 400);
    }

    if (!process.env.GEMINI_API_KEY) {
      return errorResponse(res, "Gemini API is not configured", 500);
    }

    if (!googleGenAI) {
      return errorResponse(res, "Gemini SDK not initialized", 500);
    }

    const response = await googleGenAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are FutureWings AI Assistant. Your role is to help students with study abroad planning, documents, countries, and applications in clear, organized, and practical guidance.

FORMAT YOUR RESPONSES AS FOLLOWS:
1. Start with a brief introduction paragraph (2-3 sentences).
2. Use serial numbering (1, 2, 3, etc.) for main points or steps.
3. Under each numbered point, write organized paragraphs (not bullet points).
4. Use section headers (bold or plain) to organize major topics.
5. End with actionable next steps or recommendations.
6. Keep paragraphs concise (3-4 sentences each).
7. Avoid excessive bullet points; use paragraphs instead.

User question: ${message.trim()}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 600,
      },
    });

    const reply =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response?.text ||
      response?.toString();

    if (!reply) {
      return errorResponse(res, "No response from Gemini", 502);
    }

    return successResponse(res, { reply });
  } catch (error) {
    console.error("AI assistant error:", {
      message: error?.message,
    });
    const mapped = mapGeminiError(error);
    return errorResponse(res, mapped.message, mapped.statusCode);
  }
});

module.exports = router;
