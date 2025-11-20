(function() {
  const getApiKey = () => {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    return '';
  };

  function simpleSegment(text) {
    const cleanText = text.replace(/[，。？！：；、\s「」『』]/g, '');
    const totalLen = cleanText.length;
    
    if (totalLen === 0) return [];
    
    const TARGET_AVG = 15;
    const numSegments = Math.max(1, Math.round(totalLen / TARGET_AVG));
    const baseLen = Math.floor(totalLen / numSegments);
    const remainder = totalLen % numSegments;
    
    const segments = [];
    let currentPos = 0;
    
    for (let i = 0; i < numSegments; i++) {
      const segLen = baseLen + (i < remainder ? 1 : 0);
      const segment = cleanText.substring(currentPos, currentPos + segLen);
      if (segment) {
          segments.push(segment);
      }
      currentPos += segLen;
    }
    
    return segments;
  }

  const geminiService = {
    async segmentArticle(article) {
      const apiKey = getApiKey();
      
      if (!apiKey) {
        return simpleSegment(article.paragraphs.join(''));
      }

      try {
        // Dynamic import using fully qualified URL for no-module environment
        const { GoogleGenAI, Type } = await import("https://esm.sh/@google/genai");
        
        const ai = new GoogleGenAI({ apiKey });

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
        console.error("Segmentation failed or AI lib not found, using fallback:", error);
        return simpleSegment(article.paragraphs.join(''));
      }
    },
    simpleSegment
  };

  window.GameApp.services.geminiService = geminiService;
})();