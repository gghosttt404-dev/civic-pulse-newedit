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
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze claim with AI");
  }
});
