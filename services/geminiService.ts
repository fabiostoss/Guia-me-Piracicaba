import { GoogleGenAI } from "@google/genai";


export interface ExtractedBusiness {
  name: string;
  address: string;
  phone: string;
  neighborhood: string;
  category: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
}

// Helper to get or init the AI client
let aiInstance: any = null;
const getAI = () => {
  if (!aiInstance) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      throw new Error("API key must be set when using the Gemini API. Please check your .env.local file.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

export const geminiService = {
  async extractLeads(segment: string, neighborhood: string): Promise<ExtractedBusiness[]> {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      console.error("VITE_GEMINI_API_KEY não configurada.");
      return [];
    }

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `
          Procure comércios reais no segmento "${segment}" no bairro "${neighborhood}" em Piracicaba - SP.
          Use a busca do Google para obter dados precisos.
          
          Retorne uma lista JSON com: name, address, phone (formato brasileiro), neighborhood e website.
          Apenas o JSON, sem explicações.
        `,
        config: {
          //@ts-ignore - Grounding tool configuration
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "";
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(jsonStr) || [];

    } catch (error) {
      console.error("Erro na extração via Gemini:", error);
      return [];
    }
  }
};
