
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjs from "pdfjs-dist";

let genAI = new GoogleGenerativeAI("AIzaSyC2P9w5Q6FoGO9Qfp75UuamM_Wv_Jw4IwU");

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

export async function analyzeDocument(content: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are a friendly and helpful AI study assistant. Analyze this content and provide insights:

${content}

Please:
1. Summarize the key points
2. Explain any complex concepts in simple terms
3. Highlight important terms or definitions
4. Ask follow-up questions if needed to ensure understanding

Remember to be conversational and engaging in your response.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
}

export async function handleFileUpload(file: File) {
  let text = '';
  
  if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (file.type.startsWith('image/')) {
    // Convert image to base64
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const result = await model.generateContent([base64Data]);
    text = result.response.text();
  }

  // Analyze the extracted text with Gemini
  const analysis = await analyzeDocument(text);
  return { extractedText: text, analysis };
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
