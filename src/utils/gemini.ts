
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";

async function getGeminiApiKey() {
  const { data, error } = await supabase
    .from('secrets')
    .select('value')
    .eq('name', 'GEMINI_API_KEY')
    .single();
  
  if (error || !data) {
    console.error('Error fetching Gemini API key:', error);
    throw new Error('Failed to fetch Gemini API key');
  }
  
  return data.value;
}

let genAI: GoogleGenerativeAI | null = null;

async function initializeGeminiAI() {
  if (!genAI) {
    const apiKey = await getGeminiApiKey();
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function analyzeDocument(content: string) {
  try {
    const ai = await initializeGeminiAI();
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
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
    const ai = await initializeGeminiAI();
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Based on the following content, generate a quiz with 5 multiple choice questions. Format the response as a JSON array where each question object has the following properties: question, options (array of 4 choices), and correctAnswer (index of correct option). Content: ${content}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}
