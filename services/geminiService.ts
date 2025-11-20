
import { GoogleGenAI, Type } from "@google/genai";
import { Article } from '../types';

// Safely access API key with browser fallback
const getApiKey = () => {
  try {
    return typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
  } catch (e) {
    return '';
  }
};

export const geminiService = {
  async segmentArticle(article: Article): Promise<string[]> {
    const apiKey = getApiKey();
    
    // If no key, use the robust algorithmic segmentation
    if (!apiKey) {
      return this.simpleSegment(article.paragraphs.join(''));
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const content = article.paragraphs.join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Break the following Classical Chinese text into memorize-able segments for a game.
        Rules:
        1. Each segment must be between 10 and 20 characters long.
        2. Do not include punctuation in the segments.
        3. Return a flat JSON array of strings.
        
        Text: ${content}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");
      return JSON.parse(text);

    } catch (error) {
      console.error("Segmentation failed, using fallback:", error);
      return this.simpleSegment(article.paragraphs.join(''));
    }
  },

  simpleSegment(text: string): string[] {
    // Remove punctuation and spaces
    const cleanText = text.replace(/[，。？！：；、\s「」『』]/g, '');
    const totalLen = cleanText.length;
    
    if (totalLen === 0) return [];
    
    // Target average length of 15 (middle of 10-20)
    // Calculate ideal number of segments
    const TARGET_AVG = 15;
    const numSegments = Math.max(1, Math.round(totalLen / TARGET_AVG));
    
    // Calculate the exact length for each segment to be as even as possible
    const baseLen = Math.floor(totalLen / numSegments);
    const remainder = totalLen % numSegments;
    
    const segments: string[] = [];
    let currentPos = 0;
    
    for (let i = 0; i < numSegments; i++) {
      // Distribute the remainder +1 to the first few segments
      const segLen = baseLen + (i < remainder ? 1 : 0);
      const segment = cleanText.substring(currentPos, currentPos + segLen);
      segments.push(segment);
      currentPos += segLen;
    }
    
    return segments;
  }
};