
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";

let genAI: GoogleGenerativeAI | null = null;
let apiKeyRetries = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function getGeminiApiKey(): Promise<string> {
  try {
    const { data: { secret }, error } = await supabase
      .functions.invoke('get-secret', {
        body: { name: 'GEMINI_API_KEY' }
      });
    
    if (error || !secret) {
      console.error('Error fetching Gemini API key:', error);
      throw new Error('Could not fetch Gemini API key. Please check your configuration.');
    }
    
    return secret;
  } catch (error) {
    console.error('Error getting Gemini API key:', error);
    if (apiKeyRetries < MAX_RETRIES) {
      apiKeyRetries++;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * apiKeyRetries));
      return getGeminiApiKey();
    }
    throw new Error('Failed to get Gemini API key. Please try again later.');
  }
}

async function initializeGeminiAI() {
  if (!genAI) {
    try {
      const apiKey = await getGeminiApiKey();
      genAI = new GoogleGenerativeAI(apiKey);
      
      // Test the connection
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      await model.generateContent("Test connection");
      
      console.log('Gemini AI initialized successfully');
    } catch (error) {
      console.error('Error initializing Gemini AI:', error);
      genAI = null; // Reset on error
      throw new Error('Could not initialize Gemini AI. Please check your API key.');
    }
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
