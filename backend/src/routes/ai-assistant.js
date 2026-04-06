const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { successResponse, errorResponse } = require("../utils/response");

const router = express.Router();
const GEMINI_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
].filter(Boolean);
const CHAT_MAX_OUTPUT_TOKENS = Number(process.env.AI_CHAT_MAX_OUTPUT_TOKENS) || 1800;
const CHAT_MAX_CONTINUATIONS = 1;

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
  const statusCode = Number(error?.status || error?.statusCode || error?.code) || 0;

  if (statusCode === 401) {
    return {
      statusCode: 401,
      message: "Authentication failed. Please verify GEMINI_API_KEY.",
    };
  }

  if (statusCode === 403) {
    return {
      statusCode: 403,
      message: "Gemini access denied. Check API key permissions and billing.",
    };
  }

  if (statusCode === 404) {
    return {
      statusCode: 502,
      message: "Configured Gemini model is unavailable. Update GEMINI_MODEL.",
    };
  }

  if (statusCode === 429) {
    return {
      statusCode: 429,
      message: "Too many AI requests. Please wait a moment and try again.",
    };
  }

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

function isModelUnavailableError(error) {
  const message = (error?.message || "").toLowerCase();
  const statusCode = Number(error?.status || error?.statusCode || error?.code) || 0;

  return (
    statusCode === 404 ||
    message.includes("model") && (message.includes("not found") || message.includes("not supported"))
  );
}

async function generateWithModelFallback(payload) {
  if (!googleGenAI) {
    throw new Error("Gemini SDK not initialized");
  }

  let lastError;

  for (const model of GEMINI_MODEL_CANDIDATES) {
    try {
      return await googleGenAI.models.generateContent({
        ...payload,
        model,
      });
    } catch (error) {
      lastError = error;
      if (!isModelUnavailableError(error)) {
        throw error;
      }
    }
  }

  throw lastError || new Error("No Gemini model is configured");
}

function extractResponseText(response) {
  const candidateParts = response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(candidateParts) && candidateParts.length) {
    const joined = candidateParts
      .map((part) => part?.text || "")
      .join("")
      .trim();
    if (joined) {
      return joined;
    }
  }

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

function extractStringField(text, fieldName) {
  const pattern = new RegExp(`\\"${fieldName}\\"\\s*:\\s*\\"((?:[^\\"\\\\]|\\\\.)*)\\"`);
  const match = text.match(pattern);
  return match ? match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n") : "";
}

function extractNumberField(text, fieldName) {
  const pattern = new RegExp(`\\"${fieldName}\\"\\s*:\\s*(\\d+)`);
  const match = text.match(pattern);
  return match ? Number(match[1]) : 0;
}

function extractStringArrayField(text, fieldName) {
  const pattern = new RegExp(`\\"${fieldName}\\"\\s*:\\s*\\[(.*?)\\]`, "s");
  const match = text.match(pattern);

  if (!match) return [];

  return [...match[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((item) =>
    item[1].replace(/\\"/g, '"').replace(/\\n/g, "\n")
  );
}

function recoverSectionScores(text) {
  const sections = [];
  const sectionPattern = /"section"\s*:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?"score"\s*:\s*(\d+)[\s\S]*?"feedback"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let match;

  while ((match = sectionPattern.exec(text)) !== null) {
    sections.push({
      section: match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
      score: Number(match[2]),
      feedback: match[3].replace(/\\"/g, '"').replace(/\\n/g, "\n"),
    });
  }

  return sections;
}

function recoverSopReview(text) {
  const review = {
    score: extractNumberField(text, "score"),
    verdict: extractStringField(text, "verdict"),
    summary: extractStringField(text, "summary"),
    strengths: extractStringArrayField(text, "strengths"),
    improvements: extractStringArrayField(text, "improvements"),
    rewriteSuggestions: extractStringArrayField(text, "rewriteSuggestions"),
    sectionScores: recoverSectionScores(text),
    closingAdvice: extractStringField(text, "closingAdvice"),
  };

  if (!review.summary) {
    review.summary = "The SOP response was truncated before a full summary could be completed.";
  }

  if (!review.closingAdvice) {
    review.closingAdvice = "The review was partially recovered from Gemini output. Refresh and try again for a fuller result.";
  }

  return review;
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

function buildChatPrompt(message) {
  return `You are FutureWings AI Assistant, a professional and empathetic guide for international students.

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

User question: ${message.trim()}`;
}

function shouldContinueChatResponse(response) {
  const finishReason = String(response?.candidates?.[0]?.finishReason || "").toUpperCase();
  return finishReason === "MAX_TOKENS" || finishReason === "LENGTH";
}

async function generateChatReply(message) {
  let combinedReply = "";
  let prompt = buildChatPrompt(message);

  for (let i = 0; i <= CHAT_MAX_CONTINUATIONS; i += 1) {
    const response = await generateWithModelFallback({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.6,
        maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
      },
    });

    const chunk = extractResponseText(response).trim();
    if (!chunk) {
      break;
    }

    combinedReply = combinedReply ? `${combinedReply}\n\n${chunk}` : chunk;

    if (!shouldContinueChatResponse(response) || i === CHAT_MAX_CONTINUATIONS) {
      break;
    }

    prompt = `Continue your previous answer exactly from where you stopped.
Do not restart and do not repeat earlier sections.
Return only the continuation text.

Original user question: ${message.trim()}

Already generated text:
${combinedReply}`;
  }

  return combinedReply;
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

    const reply = await generateChatReply(message);

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

    const response = await generateWithModelFallback({
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
      review = recoverSopReview(text);
    }

    review.score = Math.max(0, Math.min(100, Number(review.score) || 0));

    return successResponse(res, { review, partial: !text.includes('"closingAdvice"') || !review.sectionScores.length });
  } catch (error) {
    console.error("SOP review error:", {
      message: error?.message,
    });
    const mapped = mapGeminiError(error);
    return errorResponse(res, mapped.message, mapped.statusCode);
  }
});

module.exports = router;
