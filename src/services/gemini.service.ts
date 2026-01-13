import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

// Interfaces for structured data
export interface RecyclingGuidance {
  category: "Dry" | "Wet" | "Hazardous" | "E-Waste";
  preparationSteps: string[];
  environmentalImpact: string;
  handlingRisk: 'Safe' | 'Moderate' | 'Hazardous';
}

export interface UpcyclingRecipe {
  idea: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  materialsNeeded: string[];
  instructions: string[];
  estimatedTime: string;
}

export interface WasteAnalysis {
  wasteType: string;
  confidence: number;
  isRecyclable: boolean;
  materialComposition: string[];
  condition: 'Intact' | 'Broken' | 'Degraded/Weathered' | 'Contaminated';
  riskLevel: 'Low' | 'Medium' | 'High';
  biologicalCategory: 'Organic' | 'Non-Organic';
  reasoning: string;
  funFact: string;
  recyclingGuidance: RecyclingGuidance;
  upcyclingRecipe?: UpcyclingRecipe;
  points: number;
  estimatedWeight: number;
  urbanArtifactStory: string;
}

export type ActivityType = 'Walking' | 'Running' | 'Cycling';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private readonly modelId = 'gemini-2.5-flash';
  private readonly apiKey = import.meta.env.VITE_API_KEY;

  constructor() {
    if (!this.apiKey) {
      throw new Error("API key is missing. Please set it in your environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async analyzeImage(
    imageBase64: string,
    context: { timestamp?: Date; lat?: number; lng?: number; activity?: ActivityType } = {}
  ): Promise<WasteAnalysis> {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, '');
      const { timestamp = new Date(), lat, lng, activity = 'Walking' } = context;
      const locationInfo = lat ? `Lat: ${lat}, Lng: ${lng}` : 'Urban Area';

      const systemInstruction = this.getSystemInstruction();
      const userPrompt = this.getUserPrompt(timestamp, activity, locationInfo);

      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: [{
          role: 'user',
          parts: [
            { text: userPrompt },
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
          ]
        }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: this.getResponseSchema()
        }
      });

      if (response.text) {
        return this.parseApiResponse(response.text);
      } else {
        throw new Error('No response text from Gemini');
      }
    } catch (error) {
      this.handleError('Gemini Analysis Failed', error);
      throw error;
    }
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: `You are EcoScout, a helpful urban ecology assistant.
        Answer the user's question about recycling, waste management, or sustainability in a concise, encouraging, and factual way.
        Keep the tone gamified and professional.
        User Query: ${message}`
      });
      return response.text || "I'm having trouble connecting to the network. Try again later.";
    } catch (error) {
      this.handleError('Chat Error', error);
      return "I'm offline right now. Please check your connection.";
    }
  }

  private getSystemInstruction(): string {
    return `
      You are an advanced AI Waste Management Specialist and Ecologist for the "EcoSnap" application.
      MISSION: Analyze the image to identify waste items with high precision, determine the correct disposal method based on Indian Municipal Solid Waste (MSW) Rules 2016, and suggest value-added upcycling if applicable.
      CLASSIFICATION PROTOCOLS:
      1. **Material Identification**: Specifics like Resin Codes for plastics, types of paper, e-waste, hazardous materials, metals, and glass.
      2. **Segregation Categories**: Dry, Wet, Hazardous, E-Waste.
      3. **Upcycling Engine**: Provide a recipe only if the item is 'Intact', 'Low' risk, and 'Non-Organic'.
      4. **Scoring Logic**: E-Waste/Hazardous: 100-200 points, Plastics/Metals: 20-50 points, Paper/Organic: 10-20 points.
      Output must be pure JSON adhering to the defined schema.
    `;
  }

  private getUserPrompt(timestamp: Date, activity: ActivityType, locationInfo: string): string {
    return `
      Analyze this image captured at ${timestamp.toLocaleString()} during a ${activity} session at [${locationInfo}].
      Focus on the central object, prioritizing the most environmentally significant one.
      Assess Condition, Risk, and provide a 1-sentence "Urban Artifact Story".
    `;
  }

  private getResponseSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        wasteType: { type: Type.STRING, description: "Specific name of the item (e.g. 'Crushed PET Bottle')" },
        confidence: { type: Type.NUMBER, description: "Confidence score 0-100" },
        isRecyclable: { type: Type.BOOLEAN },
        materialComposition: { type: Type.ARRAY, items: { type: Type.STRING } },
        condition: { type: Type.STRING, enum: ['Intact', 'Broken', 'Degraded/Weathered', 'Contaminated'] },
        riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
        biologicalCategory: { type: Type.STRING, enum: ['Organic', 'Non-Organic'] },
        reasoning: { type: Type.STRING, description: "Technical analysis of the visual features." },
        urbanArtifactStory: { type: Type.STRING, description: "A creative sentence about the item's history." },
        funFact: { type: Type.STRING, description: "An educational fact about this material." },
        recyclingGuidance: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ["Dry", "Wet", "Hazardous", "E-Waste"] },
            preparationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            environmentalImpact: { type: Type.STRING },
            handlingRisk: { type: Type.STRING, enum: ["Safe", "Moderate", "Hazardous"] }
          },
          required: ["category", "preparationSteps", "environmentalImpact", "handlingRisk"]
        },
        upcyclingRecipe: {
          type: Type.OBJECT,
          properties: {
            idea: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
            materialsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedTime: { type: Type.STRING }
          }
        },
        points: { type: Type.INTEGER },
        estimatedWeight: { type: Type.NUMBER, description: "Estimated weight in grams" }
      },
      required: ["wasteType", "confidence", "isRecyclable", "condition", "riskLevel", "biologicalCategory", "recyclingGuidance", "reasoning", "points", "urbanArtifactStory"]
    };
  }

  private parseApiResponse(responseText: string): WasteAnalysis {
    try {
      const sanitizedText = responseText.replace(/```json\s*|```/g, '');
      return JSON.parse(sanitizedText) as WasteAnalysis;
    } catch (parseError) {
      this.handleError('JSON Parse Error', parseError, responseText);
      throw new Error('Failed to parse AI response.');
    }
  }

  private handleError(message: string, error: any, context?: any) {
    console.error(`${message}:`, error);
    if (context) {
      console.error('Context:', context);
    }
  }
}