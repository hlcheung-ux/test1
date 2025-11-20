
import { GoogleGenAI, Type } from "@google/genai";
import { Article } from '../types';

// Safely access API key
const getApiKey = () => process.env.API_KEY || '';

export const geminiService = {
  async segmentArticle(article: Article): Promise<string[]> {
    const apiKey = getApiKey();
    
    // If no key, use a simple fallback segmentation
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
      console.error("Segmentation failed:", error);
      return this.simpleSegment(article.paragraphs.join(''));
    }
  },

  simpleSegment(text: string): string[] {
    // Remove punctuation
    const cleanText = text.replace(/[，。？！：；、\s]/g, '');
    
    const segments: string[] = [];
    let startIndex = 0;
    const textLen = cleanText.length;
    
    // Simple greedy chunking between 10 and 20 chars
    while (startIndex < textLen) {
      // Default chunk size 10
      let chunkSize = 10;
      
      // If remaining is small (e.g. 12), take it all
      if (textLen - startIndex <= 20) {
        chunkSize = textLen - startIndex;
      } else {
         // Vary slightly for randomness if desired, but here we stick to ~10-14
         // to prevent leftovers being too small
         chunkSize = 14;
      }

      const segment = cleanText.substring(startIndex, startIndex + chunkSize);
      if (segment.length > 0) {
        segments.push(segment);
      }
      startIndex += chunkSize;
    }

    return segments;
  }
};
