require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

async function generateCoverLetter(jobTitle, jobDescription) {
  try {
    const prompt = `As an expert in crafting engaging job applications, create a concise and creative cover letter for the following job posting. The letter should:
- Start by asking 1 or 2 thoughtful, job-specific questions to show interest and understanding of the project
- Follow that with 1 or 2 sentences expressing enthusiasm and suitability for the job
- Briefly mention your relevant experience and skills that align with the client's needs
- Use a natural, fluent tone without making it sound like it's written by AI
- The cover letter should be between 150-200 words, demonstrating professionalism and personal engagement

Job Title: ${jobTitle}

Job Description: ${jobDescription}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating cover letter with Gemini AI:", error);
    return "Unable to generate cover letter.";
  }
}

module.exports = { generateCoverLetter };
