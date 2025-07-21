const { GoogleGenAI } = require('@google/genai');

require('dotenv').config();

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function generateResponse(inputText) {
    if (!inputText) {
        throw new Error('Input text is required');
    }

    const prompt = `
Tolong ekstrak informasi pengeluaran dari kalimat berikut.

Contoh input:
- "beli cilok 5rb"
- "bayar kos 1,25 juta"
- "jajan es krim 10k"

Untuk setiap input, hasilkan JSON dengan struktur:
{
  "description": "...",
  "amount": ..., // dalam angka, rupiah
  "category": "...", // boleh 'Uncategorized' kalau tidak yakin
  "date": "now"
}

Input: "${inputText}"
`;

    response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    // console.log(response);

    // loop through candidates and log their content
    for (let i = 0; i < response.candidates.length; i++) {
        if (response.candidates[i].error) {
            console.error(`Error in candidate ${i + 1}:`, response.candidates[i].error);
            continue;
        }
        if (!response.candidates[i].content) {
            console.error(`No content in candidate ${i + 1}`);
            continue;
        }

        try {
            // Extract text from parts array
            const textContent = response.candidates[i].content.parts[0].text;

            // Extract JSON from markdown code block
            const jsonMatch = textContent.match(/```json\n([\s\S]*?)\n```/);
            if (!jsonMatch) {
                console.error(`No JSON found in candidate ${i + 1}`);
                continue;
            }

            const jsonString = jsonMatch[1];
            const parsedContent = JSON.parse(jsonString);

            return parsedContent;
        } catch (error) {
            console.error(`Error parsing candidate ${i + 1} content:`, error);
        }
    }
}

module.exports = { generateResponse };