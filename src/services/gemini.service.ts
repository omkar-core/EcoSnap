import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

export interface RecyclingGuidance {
  category: string; // e.g., "Dry Waste (Blue Bin)", "Wet Waste (Green Bin)"
  preparationSteps: string[]; // e.g., ["Rinse thoroughly", "Crush to save space", "Remove cap"]
  environmentalImpact: string; // e.g., "Saves 500 years of landfill time"
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
  wasteType: string; // "Plastic Bottle"
  confidence: number; // 0-100
  isRecyclable: boolean;
  materialComposition: string[]; // ["PET", "Paper"]
  
  // CORE FEATURE ADDITIONS:
  condition: 'Intact' | 'Broken' | 'Degraded/Weathered' | 'Contaminated';
  riskLevel: 'Low' | 'Medium' | 'High'; // For "Hazardous" logic
  biologicalCategory: 'Organic' | 'Non-Organic'; 
  
  reasoning: string; // The "AI Brain" explanation
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
  private modelId = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async analyzeImage(
    imageBase64: string, 
    context?: { timestamp?: Date, lat?: number, lng?: number, activity?: ActivityType }
  ): Promise<WasteAnalysis> {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, '');

      const timestamp = context?.timestamp ? context.timestamp.toLocaleString() : new Date().toLocaleString();
      const locationInfo = context?.lat ? `Coordinates: ${context.lat}, ${context.lng}` : 'Urban setting';
      const activity = context?.activity || 'Walking';

      // Advanced Chain-of-Thought Prompt based on Product Vision
      const promptText = `
        You are an elite Waste Management Specialist, Polymer Chemist, and Urban Anthropologist.
        
        CONTEXT:
        - Region: India (Swachh Bharat Context).
        - Location: ${locationInfo}
        - Time: ${timestamp}
        - Activity: ${activity} (User is active, keep output actionable).
        - Input: Camera frame from a fitness run.

        YOUR TASK:
        Perform a high-precision analysis of the waste item to classify it into specific material sub-types, determine the correct segregation stream, and suggest creative reuse if applicable.

        1. **Precise Material Identification (Must be specific)**:
           - **Plastics**: Identify resin codes if possible: PET (1), HDPE (2), PVC (3), LDPE (4), PP (5), PS (6), or Multi-layered Plastic (MLP/Wrappers).
           - **Paper**: Cardboard, Newspaper, Glossy Magazine, Beverage Carton (Tetra Pak), Soiled/Wet Paper (tissue/napkins).
           - **E-Waste**: Batteries (Lithium/Alkaline), Cables, PCBs, Screens, Peripherals.
           - **Hazardous**: Medical (masks, syringes, gloves), Sanitary (diapers, pads), Chemical containers, Light bulbs.
           - **Metals**: Aluminum Cans, Steel Tins, Copper Wire.
           - **Glass**: Clear, Colored, Broken.

        2. **Strict Segregation Category**:
           - **Dry Waste (Blue Bin)**: Clean plastics, paper, metal, dry glass, Tetra Paks.
           - **Wet Waste (Green Bin)**: Food scraps, organic decay, soiled paper/tissues.
           - **Hazardous Waste (Red Bin)**: Biomedical, sanitary waste, sharps, household chemicals.
           - **E-Waste (Grey/Black Bin)**: Electronic components, batteries.

        3. **Condition & Risk Assessment**:
           - **Condition**: 'Intact' (Reusable?), 'Broken' (Sharp?), 'Degraded/Weathered' (Microplastic risk?), 'Contaminated' (Food/Dirt?).
           - **Risk Level**: 'Low' (Clean dry waste), 'Medium' (Food rot, sharp metal, broken glass), 'High' (Bio-medical, Sanitary, Toxic chemicals, leaking batteries).

        4. **Action Plan**:
           - **Recycling**: Preparation steps (e.g., "Rinse and dry", "Flatten", "Wrap in newspaper").
           - **Upcycling**: If the item is 'Safe' and 'Intact', provide a creative DIY idea suitable for an Indian home/garden using common household materials.
             * **REQUIREMENT**: You MUST provide a specific list of materials needed, step-by-step instructions, difficulty, and estimated time.

        5. **Anthropological Insight**:
           - **Urban Artifact Story**: A 1-sentence observation on the item's age/origin. (e.g., "This sun-bleached MLP wrapper likely dates back to last season, slowly fragmenting into the soil.").

        OUTPUT JSON SCHEMA RULES:
        - 'materialComposition': Use the specific terms listed above (e.g. "PET", "Multi-layered Plastic").
        - 'recyclingGuidance.category': Must strictly match one of the 4 bin categories above.
        - 'condition', 'riskLevel', 'biologicalCategory': Follow strict enums in schema.
        - 'upcyclingRecipe': Provide ONLY if item is 'Intact' and risk is 'Low'. Populate all fields (materials, instructions, time, difficulty).

        Generate JSON response.
      `;

      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: [
          {
            role: 'user',
            parts: [
              { text: promptText },
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
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              wasteType: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              isRecyclable: { type: Type.BOOLEAN },
              materialComposition: { type: Type.ARRAY, items: { type: Type.STRING } },
              
              // New Fields Implemented
              condition: { type: Type.STRING, enum: ['Intact', 'Broken', 'Degraded/Weathered', 'Contaminated'] },
              riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              biologicalCategory: { type: Type.STRING, enum: ['Organic', 'Non-Organic'] },

              reasoning: { type: Type.STRING },
              urbanArtifactStory: { type: Type.STRING },
              funFact: { type: Type.STRING },
              
              recyclingGuidance: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  preparationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  environmentalImpact: { type: Type.STRING },
                  handlingRisk: { type: Type.STRING, enum: ["Safe", "Moderate", "Hazardous"] }
                }
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
              estimatedWeight: { type: Type.NUMBER }
            },
            required: ["wasteType", "confidence", "isRecyclable", "condition", "riskLevel", "biologicalCategory", "recyclingGuidance", "reasoning", "points", "urbanArtifactStory"]
          }
        }
      });

      if (response.text) {
        let text = response.text;
        
        // 1. Strip Markdown Code Blocks
        text = text.replace(/```json\s*|```/g, '');
        
        // 2. Find JSON boundaries to handle any preamble/postamble
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
          text = text.substring(firstBrace, lastBrace + 1);
        }

        try {
          return JSON.parse(text) as WasteAnalysis;
        } catch (parseError) {
           console.error('JSON Parse Error:', parseError, 'Raw Text:', response.text);
           throw new Error('Failed to parse AI response. The model output was not valid JSON.');
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
        contents: `You are EcoScout, a helpful urban ecology assistant. 
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