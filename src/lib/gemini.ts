import { createServerFn } from "@tanstack/react-start";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export type AnalysisResult = {
  score: number;
  points: string[];
  summary: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export const analyzeClaim = createServerFn("POST", async (text: string) => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze the following infrastructure project claim or news snippet for potential "ghost projects" (projects that exist on paper/funds but not in reality) or corruption indicators.
    
    Claim text: "${text}"
    
    Provide a JSON response with:
    1. "score": A ghost score from 0-100 (higher means more likely to be a ghost project or corrupt).
    2. "points": A list of 4 specific warning indicators or findings.
    3. "summary": A brief summary of the risk.
    4. "severity": One of "LOW", "MEDIUM", "HIGH", or "CRITICAL" based on the score.
    
    Return ONLY valid JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr) as AnalysisResult;
  }
});

export const chatWithNagrikBot = createServerFn("POST", async (payload: { messages: { role: string; content: string }[]; context?: string }) => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `
    You are NagrikBot, a helpful AI assistant for NagrikAI (Civic Pulse).
    Your goal is to help Indian citizens with:
    1. Understanding government schemes.
    2. Drafting RTIs (Right to Information) for suspicious infrastructure projects.
    3. Analyzing potential "ghost projects" (corruption where money is released but no work is done).
    
    Current context: ${payload.context || "General conversation"}
    
    Guidelines:
    - Be polite, professional, and helpful.
    - If asked about specific schemes, provide accurate details based on Indian government data.
    - If asked about a project, suggest generating an RTI if there's suspicion of corruption.
    - Keep responses concise and focused.
    - Use Indian English and common terms (like "Lakh", "Crore", "Panchayat").
  `;

  try {
    const chat = model.startChat({
      history: payload.messages.slice(0, -1).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const lastMsg = payload.messages[payload.messages.length - 1].content;
    const prompt = `${systemPrompt}\n\nUser: ${lastMsg}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again in a moment.";
  }
});
