import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: "You are an expert botanist and gardening assistant. Provide helpful, accurate, and encouraging advice about plant care, gardening tips, and troubleshooting plant diseases. Keep answers concise but informative.",
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  return await chat.sendMessageStream({ message });
};

export const analyzePlantImage = async (base64Image: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Identify this plant. Provide the response in valid Markdown format. 
            Include the following sections clearly labeled with headers (##): 
            1. **Plant Name** (Common and Scientific)
            2. **Short Description**
            3. **Care Instructions** (Light, Water, Soil, Humidity)
            4. **Pro Tip**`
          },
        ],
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};
