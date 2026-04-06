const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();
const GEMINI_MODEL = "gemini-3-flash-preview";

const sopReviewSchema = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      description: "Overall SOP score from 0 to 100.",
    },
    verdict: {
      type: "string",
      description: "Short overall verdict.",
    },
    summary: {
      type: "string",
      description: "A concise summary of the SOP quality.",
    },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    improvements: {
      type: "array",
      items: { type: "string" },
    },
    rewriteSuggestions: {
      type: "array",
      items: { type: "string" },
    },
    sectionScores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: { type: "string" },
          score: { type: "integer" },
          feedback: { type: "string" },
        },
        required: ["section", "score", "feedback"],
      },
    },
    closingAdvice: {
      type: "string",
      description: "Final advice for improving the SOP before submission.",
    },
  },
  required: [
    "score",
    "verdict",
    "summary",
    "strengths",
    "improvements",
    "rewriteSuggestions",
    "sectionScores",
    "closingAdvice",
  ],
};

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

function extractResponseText(response) {
  return (
    response?.text ||
    response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    response?.toString() ||
    ""
  );
}

function parseJsonPayload(payload) {
  const cleaned = payload
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "");

  return JSON.parse(cleaned);
}

function buildSopPrompt(sopText) {
  return `You are a strict but constructive admissions reviewer for study-abroad SOPs.

Review the SOP for:
- clarity and structure
- authenticity and specificity
- academic motivation
- program/country fit
- grammar and readability
- persuasive impact

Return ONLY JSON that matches the schema. Do not include markdown, commentary, or code fences.
Keep the response compact.
Use at most 3 strengths, 3 improvements, 3 rewrite suggestions, and 4 section scores.
Keep each string under 120 characters.

Scoring guidance:
- 90-100: excellent, submission-ready SOP
- 75-89: strong SOP with a few refinements needed
- 60-74: average SOP that needs meaningful improvement
- below 60: weak SOP that needs major revision

Keep feedback practical, direct, and useful for a student preparing an application.

SOP to review:
${sopText.trim()}`;
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
      model: GEMINI_MODEL,
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
      config: {
        temperature: 0.6,
        maxOutputTokens: 800,
      },
    });

    const reply = extractResponseText(response);

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

router.post("/sop-review", requireAuth, async (req, res) => {
  try {
    const { sopText } = req.body;

    if (!sopText || typeof sopText !== "string" || !sopText.trim()) {
      return errorResponse(res, "SOP text is required", 400);
    }

    const trimmedSop = sopText.trim();

    if (trimmedSop.length < 150) {
      return errorResponse(res, "Please paste a longer SOP for a meaningful review", 400);
    }

    if (trimmedSop.length > 20000) {
      return errorResponse(res, "SOP text is too long. Please shorten it to under 20,000 characters.", 400);
    }

    if (!process.env.GEMINI_API_KEY) {
      return errorResponse(res, "Gemini API is not configured", 500);
    }

    if (!googleGenAI) {
      return errorResponse(res, "Gemini SDK not initialized", 500);
    }

    const response = await googleGenAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildSopPrompt(trimmedSop),
      config: {
        temperature: 0.3,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
        responseSchema: sopReviewSchema,
      },
    });

    const text = extractResponseText(response);

    if (!text) {
      return errorResponse(res, "No response from Gemini", 502);
    }

    let review;
    try {
      review = parseJsonPayload(text);
    } catch (parseError) {
      console.error("SOP review JSON parse error:", {
        message: parseError?.message,
        responseText: text,
      });
      return errorResponse(res, "Gemini returned an unreadable review", 502);
    }

    review.score = Math.max(0, Math.min(100, Number(review.score) || 0));

    return successResponse(res, { review });
  } catch (error) {
    console.error("SOP review error:", {
      message: error?.message,
    });
    const mapped = mapGeminiError(error);
    return errorResponse(res, mapped.message, mapped.statusCode);
  }
});

module.exports = router;
