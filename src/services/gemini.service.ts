import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

export interface RecyclingGuidance {
  category: string; // "Dry", "Wet", "Hazardous", "E-Waste"
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
  private modelId = 'gemini-1.5-flash';

  constructor() {
    const key = (import.meta as any).env.VITE_API_KEY || 'AIzaSyDummyKeyForVerificationOnly';
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async analyzeImage(
    imageBase64: string, 
    context?: { timestamp?: Date, lat?: number, lng?: number, activity?: ActivityType }
  ): Promise<WasteAnalysis> {
    try {
      // Remove header if present
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, '');

      const timestamp = context?.timestamp ? context.timestamp.toLocaleString() : new Date().toLocaleString();
      const locationInfo = context?.lat ? `Lat: ${context.lat}, Lng: ${context.lng}` : 'Urban Area';
      const activity = context?.activity || 'Walking';

      const systemInstruction = `
        You are an advanced AI Waste Management Specialist and Ecologist for the "EcoSnap" application.
        
        MISSION:
        Analyze the image to identify waste items with high precision, determine the correct disposal method based on Indian Municipal Solid Waste (MSW) Rules 2016, and suggest value-added upcycling if applicable.

        CLASSIFICATION PROTOCOLS:
        1. **Material Identification** (Be extremely specific):
           - **Plastics**: Resin Codes required: PET (1), HDPE (2), PVC (3), LDPE (4), PP (5), PS (6), MLP (Multi-layered Plastic).
           - **Paper**: Cardboard, Newspaper, Glossy Magazine, Beverage Carton (Tetra Pak), Soiled/Wet Paper, Tissue.
           - **E-Waste**: Batteries (Lithium/Alkaline/Lead), Cables, PCBs, Screens, Peripherals.
           - **Hazardous**: Medical (Masks/Gloves/Syringes), Sanitary (Diapers/Pads), Chemical Containers, Light Bulbs.
           - **Metals**: Aluminum Cans, Steel Tins, Copper.
           - **Glass**: Clear, Colored, Broken.

        2. **Segregation Categories (Strict Enum)**:
           - **Dry**: Recyclables (Plastic, Paper, Metal, Glass).
           - **Wet**: Biodegradables (Food, Garden Waste, Soiled Paper).
           - **Hazardous**: Toxic/Medical/Sanitary waste.
           - **E-Waste**: Electronic equipment.

        3. **Upcycling Engine**:
           - ONLY provide a recipe if: Condition is 'Intact' AND Risk is 'Low' AND Item is Non-Organic.
           - Recipe must be creative, feasible for a household, and use the specific item detected.

        4. **Scoring Logic**:
           - E-Waste/Hazardous: 100-200 points (High impact disposal).
           - Plastics/Metals: 20-50 points.
           - Paper/Organic: 10-20 points.

        Output must be pure JSON adhering to the defined schema.
      `;

      const userPrompt = `
        Analyze this image captured at ${timestamp} during a ${activity} session at [${locationInfo}].
        
        Focus on the central object. 
        - If multiple items exist, prioritize the most environmentally significant one (e.g., E-waste > Plastic > Paper).
        - Assess Condition: Is it broken, weathered, or intact?
        - Assess Risk: Is it sharp, toxic, or safe?
        - Provide a 1-sentence "Urban Artifact Story" imagining how this item ended up here.
      `;

      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: [
          {
            role: 'user',
            parts: [
              { text: userPrompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
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
          }
        }
      });

      if (response.text) {
        let text = response.text;
        text = text.replace(/```json\s*|```/g, '');
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          text = text.substring(firstBrace, lastBrace + 1);
        }

        try {
          return JSON.parse(text) as WasteAnalysis;
        } catch (parseError) {
           console.error('JSON Parse Error:', parseError, 'Raw Text:', response.text);
           throw new Error('Failed to parse AI response.');
        }
      } else {
        throw new Error('No response text from Gemini');
      }
    } catch (error) {
      console.error('Gemini Analysis Failed:', error);
      throw error;
    }
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: `You are EcoSnap AI, a helpful urban ecology assistant.
        Answer the user's question about recycling, waste management, or sustainability in a concise, encouraging, and factual way. 
        Keep the tone gamified and professional. 
        User Query: ${message}`
      });
      return response.text || "I'm having trouble connecting to the network. Try again later.";
    } catch (error) {
      console.error('Chat Error:', error);
      return "I'm offline right now. Please check your connection.";
    }
  }
}