const { GoogleGenAI } = require('@google/genai');

require('dotenv').config();

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function generateResponse(inputText) {
    if (!inputText) {
        throw new Error('Input text is required');
    }

    const prompt = `
Tolong deteksi apakah ini = "${inputText}" adalah permintaan laporan pengeluaran atau pencatatan transaksi.

Jika pengguna minta laporan (seperti "berapa pengeluaran minggu ini"), balas seperti ini:
{
  "intent": "report_week"
}

Jika pengguna mencatat pengeluaran (misal "beli kopi 10rb"), balas seperti ini:
{
  "intent": "add_expense",
  "data" : {
    "description": the description,
    "amount": the amount that user input,
    "category": determine from the input or uncategorized for default
  }
}
`;

    const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        temperature: 0.2,
        maxOutputTokens: 500
    });

    // loop through candidates and log their content
    for (let i = 0; i < result.candidates.length; i++) {
        if (result.candidates[i].error) {
            console.error(`Error in candidate ${i + 1}:`, result.candidates[i].error);
            continue;
        }
        if (!result.candidates[i].content) {
            console.error(`No content in candidate ${i + 1}`);
            continue;
        }

        try {
            // Extract text from parts array
            const textContent = result.candidates[i].content.parts[0].text;

            console.log('textContent =', textContent)

            // Extract JSON from markdown code block
            const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/);
            if (!jsonMatch) {
                console.error(`No JSON found in candidate ${i + 1}`);
                continue;
            }

            const jsonString = jsonMatch[1];
            const parsedContent = JSON.parse(jsonString);

            console.log(`Parsed content from candidate ${i + 1}:`, parsedContent);
            return parsedContent;
        } catch (error) {
            console.error(`Error parsing candidate ${i + 1} content:`, error);
        }
    }
}

module.exports = { generateResponse };