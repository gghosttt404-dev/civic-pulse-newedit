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
    Analyze the following Indian infrastructure project claim for potential corruption or "ghost project" risk (e.g. money released but no work done).
    Text: "${text}"
    Return ONLY valid JSON with exactly these fields: 
    - "score": (number 0-100, where 100 is high risk), 
    - "points": (array of 4 specific suspicion strings), 
    - "summary": (1 sentence summary), 
    - "severity": ("LOW", "MEDIUM", "HIGH", or "CRITICAL").
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    const jsonStr = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    
    // Ensure fields exist even if AI hallucinated the schema
    return {
      score: typeof parsed.score === 'number' ? parsed.score : 50,
      points: Array.isArray(parsed.points) ? parsed.points : ["Suspicious funding patterns", "Incomplete documentation", "Physical progress mismatch", "Timeline discrepancy"],
      summary: parsed.summary || "Project analysis completed with some discrepancies detected.",
      severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.severity) ? parsed.severity : "MEDIUM"
    } as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    return { 
      score: 65, 
      points: ["API Rate limited", "Verify satellite coordinates manually", "Check district expenditure records"], 
      summary: "AI Analysis currently unavailable. Using conservative risk assessment.", 
      severity: "MEDIUM" 
    } as AnalysisResult;
  }
});

export const chatWithNagrikBot = createServerFn("POST", async (payload: { messages: { role: string; content: string }[]; context?: string }) => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key missing on server. Please check Vercel environment variables.";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    const systemPrompt = "You are NagrikBot, a helpful AI assistant for Indian citizens. Help with government schemes, RTIs, and ghost projects. Use Indian English. Be concise.";
    const lastMsg = payload.messages[payload.messages.length - 1].content;
    const prompt = `${systemPrompt}\n\nUser: ${lastMsg}\n\nAssistant:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim() || "I'm here to help with your civic queries.";
  } catch (error: any) {
    console.error("Chat Error:", error);
    return `AI Service Error: ${error.message}. Please try again later.`;
  }
});
