import { createServerFn } from "@tanstack/react-start";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  return process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY || "";
};

export type AnalysisResult = {
  score: number;
  points: string[];
  summary: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export const analyzeClaim = createServerFn("POST", async (text: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  });

  const prompt = `
    Analyze the following infrastructure project claim for potential ghost projects.
    Text: "${text}"
    Return ONLY valid JSON with fields: score (0-100), points (list of 4 strings), summary (brief text), severity (LOW/MEDIUM/HIGH/CRITICAL).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    return { score: 50, points: ["Analysis unavailable"], summary: "AI Analysis Error", severity: "MEDIUM" } as AnalysisResult;
  }
});

export const chatWithNagrikBot = createServerFn("POST", async (payload: { messages: { role: string; content: string }[]; context?: string }) => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key missing on server. Please check Vercel environment variables.";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    });

    const systemPrompt = "You are NagrikBot, a helpful AI assistant for Indian citizens. Help with government schemes, RTIs, and ghost projects. Use Indian English. Be concise.";
    const lastMsg = payload.messages[payload.messages.length - 1].content;
    const prompt = `${systemPrompt}\n\nUser: ${lastMsg}\n\nAssistant:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    return text || "I understood your message, but I'm having trouble generating a detailed response right now. Please try again.";
  } catch (error: any) {
    console.error("Chat Error:", error);
    return `AI Service Error: ${error.message || "Unknown error"}. Please try again later.`;
  }
});
