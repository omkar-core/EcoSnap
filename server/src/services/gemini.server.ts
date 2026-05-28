import { GoogleGenAI, Type } from '@google/genai';

export const analyzeImage = async (imageBase64: string, context: any, personalKey?: string) => {
  const apiKey = personalKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';

  const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, '');
  const timestamp = context?.timestamp ? new Date(context.timestamp).toLocaleString() : new Date().toLocaleString();
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

  const responsePromise = ai.models.generateContent({
    model: modelId,
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
            description: "If an upcycling project is viable. Create an advanced Mutation Lab recipe.",
            properties: {
              idea: { type: Type.STRING, description: "A creative, unique upcycle idea name" },
              difficulty: { type: Type.STRING, description: "Difficulty tier 'Easy', 'Medium', or 'Hard'" },
              materialsNeeded: { type: Type.ARRAY, description: "Extra items required", items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, description: "Step by step instructions", items: { type: Type.STRING } },
              estimatedCarbonSaved: { type: Type.NUMBER, description: "Estimated Carbon emissions saved in grams" }
            },
            required: ["idea", "difficulty", "materialsNeeded", "instructions", "estimatedCarbonSaved"]
          },
          dnaFingerprint: {
            type: Type.OBJECT,
            description: "Deep waste DNA reading",
            properties: {
              decompositionTimeline: { type: Type.STRING, description: "Eg: 'This bottle will outlive 15 generations'" },
              toxicityLevel: { type: Type.NUMBER, description: "Estimated toxicity 0-100" },
              microplasticRisk: { type: Type.NUMBER, description: "Microplastic risk 0-100" },
              hauntingSentence: { type: Type.STRING, description: "One chilling sentence about its environmental fate" }
            },
            required: ["decompositionTimeline", "toxicityLevel", "microplasticRisk", "hauntingSentence"]
          },
          points: { type: Type.NUMBER, description: "Base XP rewarded (10-500 scale)" },
          estimatedWeight: { type: Type.NUMBER, description: "Estimated weight in grams" }
        },
        required: ["wasteType", "confidence", "isRecyclable", "condition", "riskLevel", "biologicalCategory", "recyclingGuidance", "reasoning", "points", "urbanArtifactStory"]
      }
    }
  });

  const response = await Promise.race([
    responsePromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request Timeout')), 30000))
  ]) as any;

  if (response.text) {
    let text = response.text;
    text = text.replace(/```json\s*|```/g, '');
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error('Failed to parse AI response');
    }
  } else {
    throw new Error('No response text from Gemini');
  }
};

export const chat = async (message: string, personalKey?: string) => {
  const apiKey = personalKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }
  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';

  const response = await ai.models.generateContent({
    model: modelId,
    contents: `You are EcoScout, a helpful urban ecology assistant. 
      Answer the user's question about recycling, waste management, or sustainability in a concise, encouraging, and factual way. 
      Keep the tone gamified and professional. 
      User Query: ${message}`
  });
  return response.text;
};

export const generateAriaReport = async (stats: any, personalKey?: string) => {
  const apiKey = personalKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }
  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';

  const prompt = `You are ARIA (Adaptive Reforestation Intelligence Agent), a cyberpunk-style eco-companion.
  Analyze the following Ranger statistics and formulate a short, urgent 3-sentence "Deep Scan" briefing.
  Include one hopeful tone, one critique/warning, and one tactical suggestion.
  Make it sound like a sci-fi military mission briefing. Do NOT use markdown. Max 60 words.
  
  Stats: ${JSON.stringify(stats)}`;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt
  });
  return response.text;
};
