
import { GoogleGenAI } from "@google/genai";

export async function getAiRecommendations(
  serviceName: string, 
  considerationsText: string,
  otherSelectedServices: string[]
): Promise<string> {
  // Always initialize with API key from environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a senior technical consultant for Longhorn Solar, an expert in residential energy efficiency in Central Texas.
    
    The user is configuring the service: "${serviceName}".
    The overall project currently includes: [${otherSelectedServices.join(", ")}].
    
    Site conditions and specific client notes:
    "${considerationsText}"
    
    Analyze the project and provide a professional brief focused on:
    
    1. **Price & Scope Impact**: Identify specific site conditions mentioned that will likely increase or decrease the final price (e.g., roof age, narrow access, electrical panel capacity).
    2. **Order of Operations**: If multiple services are selected, what is the mandatory or recommended sequence? (e.g., "Do the energy audit/sealing before the HVAC sizing").
    3. **Longhorn Synergy Opportunities**: How does this service benefit from or improve the other selected offerings? If there's a logical missing piece (e.g., Solar without a Smart Thermostat), recommend it.
    4. **Critical Pitfalls**: Specific Central Texas construction risks (Heat, humidity, attic accessibility).

    Format the output with bold headers. Keep it professional, high-value, and concise enough for a busy project manager.
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning and technical consultancy
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    
    // Access the text property directly (not a method)
    return response.text || "No recommendations generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate recommendations. Please check your network or try again later.";
  }
}
