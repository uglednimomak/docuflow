import { GoogleGenAI, Type } from '@google/genai';
import type { ExtractedData } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY" });
const model = 'gemini-2.0-flash-lite';

const schema = {
  type: Type.OBJECT,
  properties: {
    documentType: {
      type: Type.STRING,
      description: 'The type of the document, e.g., Invoice, Receipt, Purchase Order, Letter, Business Card.'
    },
    summary: {
      type: Type.STRING,
      description: "A brief one-sentence summary of the document content, in the document's original language."
    },
    extractedFields: {
      type: Type.ARRAY,
      description: 'A list of key-value pairs of all important information extracted from the document.',
      items: {
        type: Type.OBJECT,
        properties: {
          key: {
            type: Type.STRING,
            description: "The name of the extracted field (e.g., Invoice Number, Total Amount, Due Date), in the document's original language."
          },
          value: {
            type: Type.STRING,
            description: 'The corresponding value of the extracted field.'
          },
          keyBoundingBox: {
            type: Type.ARRAY,
            description: 'A list of normalized vertices [{x, y}, ...] defining the bounding polygon of the extracted KEY on the document image.',
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
              },
              required: ['x', 'y']
            }
          },
          valueBoundingBox: {
            type: Type.ARRAY,
            description: 'A list of normalized vertices [{x, y}, ...] defining the bounding polygon of the extracted VALUE on the document image.',
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
              },
              required: ['x', 'y']
            }
          }
        },
        required: ['key', 'value', 'keyBoundingBox', 'valueBoundingBox']
      }
    },
  },
  required: ['documentType', 'summary', 'extractedFields']
};


export async function extractDataFromDocument(
  base64Image: string,
  mimeType: string
): Promise<ExtractedData> {
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: `Thoroughly analyze this document image. Identify the document type. Extract all key information as distinct key-value pairs. For EACH extracted key AND its corresponding value, you MUST provide its precise bounding box using normalized coordinates. The extracted 'key' names and the 'summary' must be in the same language as the source document. Provide a concise one-sentence summary of the document's purpose, also in the document's original language.`,
  };
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const jsonString = response.text.trim();
    // A simple fix for potential markdown in the response
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    const parsedData: ExtractedData = JSON.parse(cleanedJsonString);
    return parsedData;
  } catch (error) {
    console.error('Error extracting data from Gemini:', error);
    throw new Error('The AI model failed to process the document. It might be unsupported or unreadable.');
  }
}
