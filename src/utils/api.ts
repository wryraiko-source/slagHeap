import { GoogleGenAI, Modality } from "@google/genai";
import { base64ToArrayBuffer, pcmToWav } from './helpers';

const apiKey = process.env.GEMINI_API_KEY || ""; 
const ai = new GoogleGenAI({ apiKey });

const textModel = "gemini-3-flash-preview";
const imageModel = "gemini-2.5-flash-image";

export async function callGemini(payload: string, systemInstruction: string, structured = false, imageBase64: string | null = null) {
  const maxRetries = 5;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const parts: any[] = [{ text: payload }];
      if (imageBase64) { 
        parts.push({ 
          inlineData: { 
            mimeType: "image/png", 
            data: imageBase64.split(',')[1] 
          } 
        }); 
      }
      
      const config: any = {
        systemInstruction: systemInstruction,
      };
      
      if (structured) {
        config.responseMimeType = "application/json";
      }

      const response = await ai.models.generateContent({
        model: textModel,
        contents: { parts },
        config
      });
      
      return response.text;
    } catch (err) {
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}

export async function generateCharacterImage(promptText: string) {
  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [
        {
          text: promptText,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      }
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }
  
  throw new Error("Image generation failure");
}

export async function callGeminiTTS(text: string, voiceName = "Fenrir") {
  const maxRetries = 3;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });
      
      const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!inlineData) throw new Error('No audio data');
      
      const sampleRate = parseInt(inlineData.mimeType.match(/rate=(\d+)/)?.[1] || "24000");
      const pcmBuffer = base64ToArrayBuffer(inlineData.data);
      const wavBlob = pcmToWav(pcmBuffer, sampleRate);
      return URL.createObjectURL(wavBlob);
    } catch (err) {
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
