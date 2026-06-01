import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';
import { CVSchema } from '@cv-generator/schema';

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
      
      - Analyze the fit between the Candidate's original CV and the Job Description to generate a 'matchAnalysis' object.
        - 'matchScore': 0-100 score indicating how well the candidate fits the role.
        - 'isRelevant': true if matchScore >= 40, false if the candidate is wildly unqualified or irrelevant.
        - 'missingSkills': an array of critical skills required by JD that the candidate lacks.
        - 'feedback': short advice for the candidate (in ${targetLanguage}).
      - Translate ALL content, including 'sectionTitles', 'labels' ('dob', 'portfolio', 'link'), education institution names, degrees, and content strictly into ${targetLanguage}.
      - Extract all available sections from the CV, including certifications, awards, activities, references, and hobbies if present.
      - Extract 'jobTitle', 'gender', and 'avatar' (URL if any) into personal if available.
      - For 'skills.category', use extremely short, 1-2 word names (e.g., 'Languages', 'Frameworks', 'Tools') translated into ${targetLanguage}. DO NOT use long descriptions.
      - Evaluate candidate's skills and append the text Rank to each skill name. Do NOT use numbers. Evaluate using this legend: Beginner, Novice, Competent, Proficient, Expert. You MUST translate the Rank into ${targetLanguage} (e.g., if Vietnamese: "ReactJS (Chuyên gia)").
      - Separate pure working experience into 'experience' and standalone projects into 'projects'. Include 'link' (github/website) for projects if available.
      - For education, ensure 'description' includes all critical details like Major, GPA, and Relevant Courses if available in the input.
      - Output MUST be ONLY valid JSON matching this exact schema:
      {
        "matchAnalysis": { "matchScore": 0, "isRelevant": true, "missingSkills": ["string"], "feedback": "string" },
        "labels": { "dob": "string", "portfolio": "string", "link": "string", "phone": "string", "email": "string", "location": "string" },
        "sectionTitles": { "summary": "string", "experience": "string", "projects": "string", "education": "string", "skills": "string", "certifications": "string", "awards": "string", "activities": "string", "references": "string", "hobbies": "string" },
        "personal": { "fullName": "string", "jobTitle": "string", "gender": "string", "avatar": "string", "dob": "string", "email": "string", "phone": "string", "location": "string", "portfolio": "string", "links": [{ "name": "string", "url": "string" }] },
        "summary": "string",
        "experience": [{ "company": "string", "position": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
        "projects": [{ "name": "string", "link": "string", "role": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
        "education": [{ "institution": "string", "degree": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
        "skills": [{ "category": "string", "items": ["string"] }],
        "certifications": [{ "name": "string", "issuer": "string", "date": "string" }],
        "awards": [{ "title": "string", "issuer": "string", "date": "string" }],
        "activities": [{ "organization": "string", "role": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
        "references": [{ "name": "string", "position": "string", "company": "string", "contactInfo": "string" }],
        "hobbies": ["string"]
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

  public async parseAndTailorCoverLetter(jobDescription: string, rawCV: string, targetLanguage: string = 'English'): Promise<any> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const model = this.genAI.getGenerativeModel({ model: modelName });

    console.log(`🤖 Đang sử dụng Model cho Cover Letter: ${modelName}`);

    const prompt = `
      You are an Expert Career Coach and Resume Writer. 
      Your task is to write a highly persuasive Cover Letter tailored to the Job Description, leveraging the candidate's background from their RAW CV.
      
      CRITICAL INSTRUCTIONS:
      - Translate ALL content into ${targetLanguage}.
      - Output MUST be ONLY valid JSON matching this exact schema:
      {
        "personal": { "fullName": "string", "jobTitle": "string", "email": "string", "phone": "string", "location": "string", "portfolio": "string", "links": [{ "name": "string", "url": "string" }] },
        "recipient": { "name": "string", "title": "string", "company": "string", "address": "string" },
        "date": "string",
        "salutation": "string",
        "opening": "string",
        "bodyParagraphs": ["string", "string"],
        "closing": "string",
        "signOff": "string"
      }
      
      - 'personal' should be extracted from the RAW CV. Extract 'fullName', 'email', 'phone', etc.
      - 'recipient' should be extracted from the Job Description. If company name or recruiter name is not found, leave as empty string or a generic term (e.g. "Hiring Manager").
      - 'date' should be today's date formatted appropriately in ${targetLanguage}.
      - 'salutation' should be a professional greeting in ${targetLanguage}.
      - 'opening' should be a strong opening statement mentioning the target role.
      - 'bodyParagraphs' should contain 2-3 paragraphs. Each paragraph MUST highlight specific skills/experiences from the RAW CV that directly match the core requirements in the Job Description. Use compelling language.
      - 'closing' should contain a call to action.
      - 'signOff' should be a professional sign-off in ${targetLanguage} followed by the candidate's name.

      --- JOB DESCRIPTION ---
      ${jobDescription}

      --- RAW CV ---
      ${rawCV}
    `;

    const config: GenerationConfig = {
      temperature: 0.7,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: config,
    });

    const response = await result.response;
    const text = response.text();

    try {
      const jsonStrMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonStrMatch ? jsonStrMatch[1] : text;
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse Cover Letter Gemini response as JSON. Raw response:', text);
      throw error;
    }
  }

  public async parseMasterProfile(rawCV: string): Promise<any> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = this.genAI.getGenerativeModel({ model: modelName });

    console.log(`🤖 Đang sử dụng Model cho Master Profile: ${modelName}`);

    const prompt = `You are an expert HR assistant. Your task is to extract information from the following CV/Profile text and format it STRICTLY as a JSON object that matches this exact TypeScript interface:
    {
      personal: {
        fullName: string,
        jobTitle?: string,
        gender?: string,
        avatar?: string,
        dob?: string,
        email: string,
        phone?: string,
        location?: string,
        portfolio?: string,
        links?: Array<{ name: string, url: string }>
      },
      careerGoals?: string,
      skills: Array<{ name: string }>, // MASTER SKILL POOL: Extract ALL skills mentioned anywhere into this array
      experience: Array<{
        companyName: string,
        roles: Array<{
          title: string,
          startDate?: string,
          endDate?: string,
          current?: boolean,
          description?: string
        }>, // If the person had multiple roles at the same company, group them here
        appliedSkills?: string[], // Cross-reference skills from the MASTER POOL used in this company
        domainTags?: string[] // e.g. ["IT", "Backend", "Finance"]
      }>,
      projects?: Array<{
        name: string,
        role?: string,
        link?: string,
        startDate?: string,
        endDate?: string,
        description?: string,
        appliedSkills?: string[], // Cross-reference skills from the MASTER POOL used in this project
        domainTags?: string[]
      }>,
      education: Array<{
        institution: string,
        degree: string,
        startDate?: string,
        endDate?: string,
        description?: string,
        domainTags?: string[]
      }>,
      languages?: Array<{
        language: string,
        proficiency?: string,
        tags?: string[]
      }>,
      certifications?: Array<{
        name: string,
        issuer?: string,
        date?: string,
        domainTags?: string[]
      }>,
      awards?: Array<{
        title: string,
        issuer?: string,
        date?: string,
        domainTags?: string[]
      }>,
      activities?: Array<{
        organization: string,
        role?: string,
        startDate?: string,
        endDate?: string,
        description?: string,
        domainTags?: string[]
      }>,
      references?: Array<{
        name: string,
        position?: string,
        company?: string,
        contactInfo?: string,
        tags?: string[]
      }>,
      hobbies?: string
    }

    CRITICAL INSTRUCTIONS:
    - Return ONLY the raw JSON object.
    - Do not include markdown code blocks like \`\`\`json or \`\`\`.
    - RELATIONAL DATA MODEL: You must extract ALL skills found in the document into the global 'skills' array. Then, for each 'experience' and 'project', figure out which of those skills were used and list their names exactly in the 'appliedSkills' array of that specific experience/project.
    - GROUPING: If a person had multiple roles/promotions at the SAME company, do NOT create separate experience entries. Create ONE experience entry for the company, and put all the roles into the 'roles' array.
    - Automatically analyze the context of each item and generate intelligent "domainTags" (industry, technical domain). Keep tags broad (e.g. "IT", "Accounting").
    - If some information is missing, leave it as an empty string or omit optional fields.
    
    Here is the CV text to parse:
    ---
    ${rawCV}
    ---`;

    const config: GenerationConfig = {
      responseMimeType: "application/json",
      temperature: 0.2,
    };

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config,
      });

      let jsonText = result.response.text().trim();
      
      // Clean up markdown if the model still outputs it
      if (jsonText.startsWith('\`\`\`json')) {
        jsonText = jsonText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
      } else if (jsonText.startsWith('\`\`\`')) {
        jsonText = jsonText.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Error parsing Master Profile with AI:', error);
      throw error;
    }
  }
}
