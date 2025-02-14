
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";

async function getGeminiApiKey(): Promise<string> {
  const { data, error } = await supabase
    .rpc('get_secret', { secret_name: 'GEMINI_API_KEY' });
  
  if (error || !data) {
    console.error('Error fetching Gemini API key:', error);
    throw new Error('Failed to fetch Gemini API key');
  }
  
  return data;
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

export async function performOCR(imageData: string) {
  try {
    const ai = await initializeGeminiAI();
    const model = ai.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const prompt = "Extract and return all the text from this image. Format it naturally with proper spacing and line breaks.";
    
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
}
