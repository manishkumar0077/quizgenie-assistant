
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeDocument(content: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(content);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
}

export async function generateQuiz(content: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Based on the following content, generate a quiz with 5 multiple choice questions. Format the response as a JSON array where each question object has the following properties: question, options (array of 4 choices), and correctAnswer (index of correct option). Content: ${content}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}
