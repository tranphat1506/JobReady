import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import { CVSchema } from '../types/schema';

export class AIParser {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async parseAndTailorCV(jobDescription: string, rawCV?: string, targetLanguage: string = 'English'): Promise<CVSchema> {
    // Dùng đúng model name dựa theo curl command mẫu của user
    const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    let specificInstructions = '';
    let cvContext = '';

    if (rawCV && rawCV.trim().length > 0) {
      specificInstructions = `
      1. Analyze the Job Description keywords. Rewrite the 'summary' and 'experience' bullet points from the RAW CV to highlight matching skills.
      2. DO NOT hallucinate or invent experiences that the candidate does not have. Only rephrase existing ones.`;
      cvContext = `--- RAW CV ---\n${rawCV}`;
    } else {
      specificInstructions = `
      1. Since no RAW CV was provided, generate a highly professional "Template CV" that perfectly matches the Job Description.
      2. Invent impressive, industry-standard experience bullet points and skills tailored to the Job Description.
      3. Use placeholders like "[Company Name]", "[2020-2023]", "[University]" for personal details and dates.
      4. Ensure the generated CV makes the candidate look like an ideal fit for the job.`;
      cvContext = `--- RAW CV ---\n(No CV provided. Please generate a tailored template from scratch based on the JD.)`;
    }

    const prompt = `
      You are an Expert Recruiter and Resume Writer. 
      Your task is to create or tailor a CV to match the provided Job Description, and output a strictly formatted JSON object.
      
      CRITICAL INSTRUCTIONS:
      ${specificInstructions}
      
      - Translate the entire final CV into ${targetLanguage}.
      - For 'skills.category', use extremely short, 1-2 word names (e.g., 'Languages', 'Frameworks', 'Tools'). DO NOT use long descriptions.
      - Evaluate candidate's skills and append a Rank (1-5) to each skill name like this: "ReactJS (4)". Use this exact legend for your evaluation:
        1- Beginner (start to learn); 2- Novice (theory only, no experience); 3- Competent (be able to do well); 4- Proficient (skilled and experienced); 5- Expert (high level of knowledge and experience)
      - Output MUST be ONLY valid JSON matching this exact schema:
      {
        "personal": { "fullName": "string", "dob": "string", "email": "string", "phone": "string", "location": "string", "portfolio": "string", "links": [{ "name": "string", "url": "string" }] },
        "summary": "string",
        "experience": [{ "company": "string", "position": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
        "education": [{ "institution": "string", "degree": "string", "startDate": "string", "endDate": "string" }],
        "skills": [{ "category": "string", "items": ["string"] }]
      }

      --- JOB DESCRIPTION ---
      ${jobDescription}

      ${cvContext}
    `;

    const generationConfig: GenerationConfig = {
      responseMimeType: "application/json",
    };

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      let responseText = result.response.text();
      
      // Dự phòng xóa markdown block nếu có
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(responseText) as CVSchema;
    } catch (error) {
      console.error('Error parsing CV with AI:', error);
      throw error;
    }
  }
}
