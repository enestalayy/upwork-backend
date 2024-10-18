require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

async function generateCoverLetter(jobTitle, jobDescription) {
  try {
    const prompt = `As an expert in crafting engaging job applications, create a concise and creative cover letter for the following job posting. The letter should:
- Start with 1-2 thought-provoking questions related to the job or industry
- Demonstrate genuine interest and enthusiasm for the position
- Highlight relevant skills or experiences without being overly detailed
- Maintain a conversational and natural tone
- Be no longer than 150-200 words

Job Title: ${jobTitle}

Job Description: ${jobDescription}

Please write the cover letter in English.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating cover letter with Gemini AI:", error);
    return "Unable to generate cover letter.";
  }
}

module.exports = { generateCoverLetter };
