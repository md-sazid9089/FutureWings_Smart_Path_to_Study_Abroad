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
              text: `You are FutureWings AI Assistant, a professional and empathetic guide for international students.

FORMATTING REQUIREMENTS:
1. Start with a professional greeting and brief context paragraph.
2. Add a blank line after the introduction.
3. Use consistent serial numbering (1., 2., 3., etc.) for all main points and steps.
4. After each numbered item, write 2-3 clear paragraphs (separate with blank lines).
5. Use section headers (e.g., "Section Name:" or "Category Name:") followed by blank lines.
6. Add a blank line between each numbered section.
7. Use formatting: bold for key terms, emphasis for important concepts.
8. End with a dedicated "Next Steps:" section with serial numbering.
9. Maintain consistent spacing and indentation throughout.
10. Keep the overall tone professional, warm, and encouraging.
11. Each major part should have clear visual separation with blank lines.

EXAMPLE STRUCTURE:
Introduction paragraph here with context.

Section Title:

1. First Point
Detailed explanation in one or two sentences. This provides context and clarification.

2. Second Point
Detailed explanation in one or two sentences. This provides context and clarification.

[Continue with blank lines between sections]

Next Steps:

1. Action item one.

2. Action item two.

User question: ${message.trim()}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 800,
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
