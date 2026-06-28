const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const buildPrompt = (combinedText) => `
You are an expert travel planner.
Use the following extracted travel document text to build a travel itinerary.
Return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "destination": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "summary": "string",
  "days": [
    {
      "day": "string",
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "string",
          "activity": "string",
          "location": "string",
          "description": "string"
        }
      ]
    }
  ],
  "tips": ["string"]
}

Do not include markdown, explanations, or extra text.

Extracted text:
${combinedText}
`;

exports.generateItineraryFromText = async (combinedText) => {
  const prompt = buildPrompt(combinedText);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const cleanedText = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleanedText);

  if (!parsed.days || !Array.isArray(parsed.days)) {
    throw new Error('Invalid itinerary format returned by Gemini');
  }

  return parsed;
};

exports.createShareToken = () => uuidv4();
