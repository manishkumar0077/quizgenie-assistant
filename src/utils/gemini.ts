import { GoogleGenerativeAI } from "@google/generative_ai";
import { supabase } from "@/integrations/supabase/client";

let genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function initializeGeminiAI() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    await model.generateContent("Test connection");
    console.log("Gemini AI initialized successfully");
  } catch (error) {
    console.error("Error initializing Gemini AI:", error);
    throw new Error("Could not initialize Gemini AI. Please check your API key.");
  }
}

export async function analyzeDocument(content: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are a friendly and helpful AI study assistant. Respond in a natural, conversational way like ChatGPT. 
    Make your responses engaging and helpful.
    
    If you need to show code examples, wrap them in triple backticks (```).
    Format your responses with proper spacing and paragraphs.
    
    User message: ${content}
    
    Remember to:
    - Be friendly and conversational
    - Use natural language
    - Be helpful and informative
    - Keep responses concise but complete
    - Format code examples in code blocks
    - Ask follow-up questions when appropriate`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Get YouTube suggestions
    const suggestions = await fetchYouTubeSuggestions(content);
    
    return {
      answer: response.text(),
      suggestions
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
}

async function fetchYouTubeSuggestions(query: string) {
  const youtubeApiKey = await getYouTubeApiKey();
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=4&key=${youtubeApiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch YouTube videos");
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      title: item.snippet.title,
      video_id: item.id.videoId,
      thumbnail_url: item.snippet.thumbnails.medium.url,
      description: item.snippet.description,
    }));
  } catch (error) {
    console.error("Error fetching YouTube suggestions:", error);
    return [];
  }
}

async function getYouTubeApiKey() {
  try {
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { key: 'YOUTUBE_API_SECRET' }
    });
    
    if (error) throw error;
    return data.value;
  } catch (error) {
    console.error('Error fetching YouTube API key:', error);
    throw new Error('Could not fetch YouTube API key');
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
    console.error("Error generating quiz:", error);
    throw error;
  }
}

export async function performOCR(imageData: string) {
  try {
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
