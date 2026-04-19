const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateQuiz(category) {
  const prompt = `Generate a 5-question multiple choice quiz about "${category}". 
Return ONLY a valid JSON object with this exact structure:
{
  "category": "${category}",
  "title": "A catchy title for the quiz",
  "questions": [
    {
      "text": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0 // index of the correct option (0-3)
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Error:", error.message || error);
    console.log("Falling back to mock quiz generation due to API error...");
    
    // Fallback Mock Quiz
    return {
      category: category,
      title: `${category} Challenge`,
      questions: [
        {
          text: `Which of the following is related to ${category}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswerIndex: 0
        },
        {
          text: `What is a core concept of ${category}?`,
          options: ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
          correctAnswerIndex: 1
        },
        {
          text: `Who is a famous figure in ${category}?`,
          options: ["Person A", "Person B", "Person C", "Person D"],
          correctAnswerIndex: 2
        },
        {
          text: `When was a major breakthrough in ${category}?`,
          options: ["1900", "1950", "2000", "2020"],
          correctAnswerIndex: 3
        },
        {
          text: `Which statement about ${category} is true?`,
          options: ["It is awesome", "It is boring", "It is irrelevant", "It is unknown"],
          correctAnswerIndex: 0
        }
      ]
    };
  }
}

module.exports = { generateQuiz };
