import { Injectable, inject } from '@angular/core';
import { environment } from '../environments/environment';
import { GameService } from './game.service';

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
  estimatedCarbonSaved: number;
}

export interface WasteDNA {
  decompositionTimeline: string;
  toxicityLevel: number; // 0-100
  microplasticRisk: number; // 0-100
  hauntingSentence: string;
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
  dnaFingerprint?: WasteDNA;
  points: number;
  estimatedWeight: number;
  urbanArtifactStory: string;
}

export type ActivityType = 'Walking' | 'Running' | 'Cycling';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private game = inject(GameService);
  private usingFallback = false;

  constructor() {
    // Listen for personal key changes across tabs/windows (optional)
    window.addEventListener('storage', (e) => {
      if (e.key === 'eco_personal_api_key') {
        this.usingFallback = false; // Reset fallback state on key change
      }
    });
  }

  private getPersonalKey(): string | undefined {
    const key = localStorage.getItem('eco_personal_api_key');
    return key && key.trim() ? key.trim() : undefined;
  }

  private handleApiError(error: any) {
    const errorMsg = error?.message || error?.toString() || '';
    const isRateLimit = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('exhausted') || errorMsg.includes('Rate limit exceeded');
    const isServerError = errorMsg.includes('500') || errorMsg.includes('503') || errorMsg.includes('timeout') || errorMsg.includes('5xx') || errorMsg.includes('AI service unavailable');

    if ((isRateLimit || isServerError) && !this.usingFallback) {
      if (this.getPersonalKey()) {
        this.usingFallback = true;
        this.game.showToast('⚡ High demand detected. EcoSnap is temporarily using your personal API key to continue service.', 'info');
        return true; // Indicates we should retry
      } else {
        this.game.showToast('High traffic detected. Add your API key in Settings to continue instantly.', 'error');
        return false; // Can't retry
      }
    }
    return false;
  }

  async analyzeImage(
    imageBase64: string,
    context?: { timestamp?: Date, lat?: number, lng?: number, activity?: ActivityType }
  ): Promise<WasteAnalysis> {
    try {
      const executeRequest = async (retries = 1): Promise<any> => {
        try {
          const personalKey = this.usingFallback ? this.getPersonalKey() : undefined;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout
          
          const response = await fetch(`${environment.apiBaseUrl}/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageBase64,
              context,
              personalKey
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            let errorData;
            try { errorData = await response.json(); } catch(e) {}
            throw new Error(errorData?.error || `HTTP error! status: ${response.status} ${response.statusText}`);
          }

          return await response.json();
        } catch (err: any) {
          if (retries > 0) {
            const shouldRetry = this.handleApiError(err);
            if (shouldRetry) {
              return await executeRequest(retries - 1);
            }
          }
          throw err;
        }
      };

      return await executeRequest(1);
    } catch (error) {
      console.error('Gemini Analysis Failed:', error);
      throw error;
    }
  }

  async chat(message: string): Promise<string> {
    const executeChat = async (retries = 1): Promise<string> => {
      try {
        const personalKey = this.usingFallback ? this.getPersonalKey() : undefined;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        const response = await fetch(`${environment.apiBaseUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            personalKey
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
           let errorData;
           try { errorData = await response.json(); } catch(e) {}
           throw new Error(errorData?.error || `HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.text || "I'm having trouble connecting to the network. Try again later.";
      } catch (err: any) {
        if (retries > 0) {
          const shouldRetry = this.handleApiError(err);
          if (shouldRetry) {
            return await executeChat(retries - 1);
          }
        }
        throw err;
      }
    };

    try {
      return await executeChat(1);
    } catch (error) {
      console.error('Chat Error:', error);
      return "I'm offline right now. Please check your connection.";
    }
  }

  async generateAriaReport(stats: any): Promise<string> {
    try {
      const personalKey = this.usingFallback ? this.getPersonalKey() : undefined;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
      const response = await fetch(`${environment.apiBaseUrl}/aria-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stats,
          personalKey
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      return data.text || "Analysis failed. Awaiting telemetry recalculation.";
    } catch (error) {
      console.error("ARIA Error", error);
      return "System offline. Deep scan telemetry corrupted.";
    }
  }
}