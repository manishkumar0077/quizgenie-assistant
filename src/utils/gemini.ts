
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";

let genAI: GoogleGenerativeAI;

async function initializeGeminiAI() {
  try {
    // Fetch API key from Supabase secrets
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { key: 'GEMINI_API_KEY' }
    });
    
    if (error) throw error;
    
    genAI = new GoogleGenerativeAI(data.value);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    await model.generateContent("Test connection");
    console.log("Gemini AI initialized successfully");
  } catch (error) {
    console.error("Error initializing Gemini AI:", error);
    throw new Error("Could not initialize Gemini AI. Please check your API key.");
  }
}

async function generateYouTubeQuery(content: string) {
  if (!genAI) {
    await initializeGeminiAI();
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Given this question or topic: "${content}", generate a short, specific YouTube search query that would find educational videos explaining this concept.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

export async function analyzeDocument(content: string): Promise<{
  answer: string;
  suggestions: Array<{
    title: string;
    video_id: string;
    thumbnail_url: string;
    description: string;
  }>;
}> {
  try {
    if (!genAI) {
      await initializeGeminiAI();
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are a friendly and helpful AI study assistant. Analyze and respond to this content: ${content}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Get tailored YouTube search query
    const searchQuery = await generateYouTubeQuery(content);
    
    // Use Supabase edge function to fetch YouTube suggestions
    const { data: suggestions, error } = await supabase.functions.invoke('youtube-suggest', {
      body: { query: searchQuery }
    });

    if (error) throw error;

    return {
      answer: response.text(),
      suggestions: suggestions.videos || [],
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
}

export async function generateQuiz(content: string) {
  try {
    if (!genAI) {
      await initializeGeminiAI();
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Based on the following content, generate a quiz with 5 multiple choice questions. Format the response as a JSON array where each question object has the following properties: question, options (array of 4 choices), and correctAnswer (index of correct option). Content: ${content}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}

export async function performOCR(imageData: string) {
  try {
    if (!genAI) {
      await initializeGeminiAI();
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const prompt = "Extract and return all the text from this image. Format it naturally with proper spacing and line breaks.";
    
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error performing OCR:", error);
    throw error;
  }
}
