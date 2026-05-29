import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import { CVSchema } from '../types/schema';

export class AIParser {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public async parseAndTailorCV(jobDescription: string, rawCV?: string, targetLanguage: string = 'English'): Promise<CVSchema> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const model = this.genAI.getGenerativeModel({ model: modelName });

    console.log(`🤖 Đang sử dụng Model: ${modelName}`);
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
      
      - Translate ALL content, including the generated section titles ('sectionTitles'), education institution names, degrees, and content strictly into ${targetLanguage}.
      - For 'skills.category', use extremely short, 1-2 word names (e.g., 'Languages', 'Frameworks', 'Tools'). DO NOT use long descriptions.
      - Evaluate candidate's skills and append the text Rank to each skill name like this: "ReactJS (Expert)". Do NOT use numbers. Use this exact legend for your evaluation:
        Beginner (start to learn); Novice (theory only, no experience); Competent (be able to do well); Proficient (skilled and experienced); Expert (high level of knowledge and experience)
      - Separate pure working experience into 'experience' and standalone projects into 'projects'. Include 'link' (github/website) for projects if available.
      - For education, ensure 'description' includes all critical details like Major, GPA, and Relevant Courses if available in the input.
      - Output MUST be ONLY valid JSON matching this exact schema:
      {
        "sectionTitles": { "summary": "string", "experience": "string", "projects": "string", "education": "string", "skills": "string" },
        "personal": { "fullName": "string", "dob": "string", "email": "string", "phone": "string", "location": "string", "portfolio": "string", "links": [{ "name": "string", "url": "string" }] },
        "summary": "string",
        "experience": [{ "company": "string", "position": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
        "projects": [{ "name": "string", "link": "string", "role": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
        "education": [{ "institution": "string", "degree": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
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

      // In thông số Token tiêu hao
      if (result.response.usageMetadata) {
        console.log('\n📊 THỐNG KÊ TOKEN SỬ DỤNG (Gemini):');
        console.log(`- Prompt Tokens (đầu vào): ${result.response.usageMetadata.promptTokenCount}`);
        console.log(`- Output Tokens (đầu ra):  ${result.response.usageMetadata.candidatesTokenCount}`);
        console.log(`- Tổng Tokens:             ${result.response.usageMetadata.totalTokenCount}\n`);
      }

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
