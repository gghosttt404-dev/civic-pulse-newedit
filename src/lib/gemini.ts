import { createServerFn } from "@tanstack/react-start";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  return process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY || "";
};

const genAI = new GoogleGenerativeAI(getApiKey());

export type AnalysisResult = {
  score: number;
  points: string[];
  summary: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export const analyzeClaim = createServerFn("POST", async (text: string) => {
  const apiKey = getApiKey();
  if (!apiKey) {
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
    if (!jsonStr) throw new Error("Empty response from Gemini");
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      score: 50,
      points: ["Analysis currently unavailable"],
      summary: "We couldn't perform a live AI analysis at this moment.",
      severity: "MEDIUM"
    } as AnalysisResult;
  }
});

export const chatWithNagrikBot = createServerFn("POST", async (payload: { messages: { role: string; content: string }[]; context?: string }) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("SERVER ERROR: GOOGLE_API_KEY is missing");
    return "I'm sorry, my API key is missing. Please check the environment variables.";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `
    You are NagrikBot, a helpful AI assistant for NagrikAI (Civic Pulse).
    Your goal is to help Indian citizens with:
    1. Understanding government schemes (like PM-KISAN, Ayushman Bharat, etc.).
    2. Drafting RTIs (Right to Information) for suspicious infrastructure projects.
    3. Analyzing potential "ghost projects" (corruption where money is released but no work is done).
    
    Current context: ${payload.context || "General conversation"}
    
    Guidelines:
    - Be polite, professional, and helpful.
    - If asked about specific schemes, provide accurate details.
    - If asked about a project, suggest generating an RTI if there's suspicion of corruption.
    - Keep responses concise and focused.
    - Use Indian English terms (Lakh, Crore, Panchayat).
  `;

  try {
    const lastMsg = payload.messages[payload.messages.length - 1].content;
    const prompt = `${systemPrompt}\n\nUser: ${lastMsg}\n\nAssistant:`;
    
    console.log("Sending prompt to Gemini:", lastMsg);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    if (!text) {
      console.warn("Gemini returned empty text, retrying with simpler prompt...");
      const simpleResult = await model.generateContent(lastMsg);
      return simpleResult.response.text().trim() || "I understood your message, but I'm having trouble generating a detailed response right now.";
    }

    return text;
  } catch (error: any) {
    console.error("Gemini Chat Error Details:", error);
    return `I encountered an error: ${error.message || "Unknown error"}. Please try again.`;
  }
});
