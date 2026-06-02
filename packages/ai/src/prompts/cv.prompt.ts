/**
 * Prompt builder for parseAndTailorCV.
 * Returns the full prompt string to send to Gemini.
 */
export function buildCVPrompt(
  jobDescription: string,
  rawCV: string | undefined,
  targetLanguage: string
): string {
  let specificInstructions: string;
  let cvContext: string;

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

  return `
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
    - Separate pure working experience into 'experience' and standalone projects into 'projects'. Include 'links' (github/website/demo) for projects if available.
    - For education, ensure 'description' includes all critical details like Major, GPA, and Relevant Courses if available in the input.
    - Output MUST be ONLY valid JSON matching this exact schema:
    {
      "matchAnalysis": { "matchScore": 0, "isRelevant": true, "missingSkills": ["string"], "feedback": "string" },
      "labels": { "dob": "string", "portfolio": "string", "link": "string", "phone": "string", "email": "string", "location": "string" },
      "sectionTitles": { "summary": "string", "experience": "string", "projects": "string", "education": "string", "skills": "string", "certifications": "string", "awards": "string", "activities": "string", "references": "string", "hobbies": "string" },
      "personal": { "fullName": "string", "jobTitle": "string", "gender": "string", "avatar": "string", "dob": "string", "email": "string", "phone": "string", "location": "string", "portfolio": "string", "links": [{ "name": "string", "url": "string" }] },
      "summary": "string",
      "experience": [{ "company": "string", "position": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
      "projects": [{ "name": "string", "links": [{ "name": "string", "url": "string" }], "role": "string", "startDate": "string", "endDate": "string", "description": ["string"] }],
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
}
