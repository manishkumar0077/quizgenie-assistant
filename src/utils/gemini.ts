import OpenAI from "openai";

// Using the provided API key for testing purposes
// NOTE: For production, consider using environment variables or a secure backend
const openai = new OpenAI({ apiKey: "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" });

async function initializeOpenAI() {
  try {
    await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: "Test connection" }],
    });
    console.log("OpenAI initialized successfully");
  } catch (error) {
    console.error("Error initializing OpenAI:", error);
    throw new Error("Could not initialize OpenAI. Please check your API key.");
  }
}

export async function analyzeDocument(content) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: content }],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
}

export async function generateQuiz(content) {
  try {
    const prompt = `Based on the following content, generate a quiz with 5 multiple-choice questions. Format the response as a JSON array where each question object has the following properties: question, options (array of 4 choices), and correctAnswer (index of correct option). Content: ${content}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}

export async function performOCR(imageData) {
  try {
    const prompt = "Extract and return all the text from this image. Format it naturally with proper spacing and line breaks.";
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [{ role: "user", content: prompt }, { role: "user", content: imageData }],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error performing OCR:", error);
    throw error;
  }
}

