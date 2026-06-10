/**
 * Prompt builder for parseAndTailorCV.
 * Accepts either a structured MasterProfile JSON object or raw CV text.
 */
export function buildCVPrompt(
  jobDescription: string,
  rawCV: string | undefined,
  targetLanguage: string,
  masterProfile?: object,
  toneOfVoice?: string
): string {
  let candidateContext: string;
  let specificInstructions: string;
  const toneInstruction = toneOfVoice 
    ? `\n      - TONE OF VOICE: The candidate prefers a "${toneOfVoice}" tone. Adjust the vocabulary, phrasing, and style of all bullet points and summaries to perfectly match this tone.`
    : '';

  if (masterProfile) {
    // Structured Master Profile path — no hallucination allowed
    specificInstructions = `
      1. Analyze the Job Description keywords and tailor the CV content to highlight matching skills.
      2. Modify the 'personal.jobTitle' to accurately match the target role title specified in the Job Description, demonstrating the candidate's alignment.
      3. DO NOT hallucinate or invent experiences or skills not present in the Master Profile. Only rephrase and reorder existing content.
      4. Use the Master Profile as the single source of truth for other personal info, experience, projects, and education.`;
    candidateContext = `--- MASTER PROFILE (Structured JSON) ---\n${JSON.stringify(masterProfile, null, 2)}`;
  } else if (rawCV && rawCV.trim().length > 0) {
    // Legacy: raw CV text path
    specificInstructions = `
      1. Analyze the Job Description keywords. Rewrite the 'summary' and 'experience' bullet points from the RAW CV to highlight matching skills.
      2. DO NOT hallucinate or invent experiences that the candidate does not have. Only rephrase existing ones.`;
    candidateContext = `--- RAW CV ---\n${rawCV}`;
  } else {
    // No input: generate template from JD
    specificInstructions = `
      1. Since no candidate data was provided, generate a highly professional "Template CV" that perfectly matches the Job Description.
      2. Invent impressive, industry-standard experience bullet points and skills tailored to the Job Description.
      3. Use placeholders like "[Company Name]", "[2020-2023]", "[University]" for personal details and dates.
      4. Ensure the generated CV makes the candidate look like an ideal fit for the job.`;
    candidateContext = `--- CANDIDATE DATA ---\n(No data provided. Generate a tailored template from scratch based on the JD.)`;
  }

  return `
    You are an Expert Recruiter and Resume Writer.
    Your task is to create or tailor a CV to match the provided Job Description, and output a strictly formatted JSON object.

    CRITICAL INSTRUCTIONS:
    ${specificInstructions}${toneInstruction}

    - Analyze the fit between the Candidate's data and the Job Description to generate a 'matchAnalysis' object.
      - 'matchScore': 0-100 score indicating how well the candidate fits the role overall.
      - 'isRelevant': true if matchScore >= 40, false otherwise.
      - 'jobLevel': Extracted or assumed job title/level for the analysis (e.g., "Senior Backend", "Junior Frontend").
      - 'keywordMatch': Ratio of matched keywords from JD (e.g., "8/14").
      - 'breakdown': Object containing score (0-100) and weight (0-1) for: skills, experience, education, keywords. Ensure weights sum to 1.0.
      - 'missingSkillsDetails': Object containing 'critical' (must-have) and 'niceToHave' arrays of skills missing from candidate.
      - 'suggestedAdditions': Array of objects { skill, reason } for skills the candidate likely has but didn't explicitly mention.
      - 'structuredFeedback': Object with 'summary' (short text), 'strengths' (array of strings), 'improvements' (array of strings). (ALL in ${targetLanguage}).
    - Translate ALL output content (sectionTitles, labels, bullet points, etc.) strictly into ${targetLanguage}.
    - Extract all available sections: certifications, awards, activities, references, hobbies if present.
    - If there is any content in the Candidate's data that does not fit into the standard sections above (e.g. Publications, Volunteer Work, Custom Skills, Test Scores, etc.), put it into the 'customSections' array. Use a highly professional title for each custom section translated into ${targetLanguage}.
    - For 'skills.category', use extremely short, 1-2 word names (e.g., 'Languages', 'Frameworks', 'Tools') translated into ${targetLanguage}.
    - Evaluate each skill and append a proficiency rank. Use: Beginner, Novice, Competent, Proficient, Expert — translated into ${targetLanguage} (e.g., Vietnamese: "ReactJS (Thành thạo)").
    - Separate pure working experience into 'experience' and standalone projects into 'projects'. Include 'links' array (github/website/demo) for projects if available.
    - For education, ensure 'description' is strictly an ARRAY OF STRINGS (e.g. ["Major: AI", "GPA: 2.75", "Relevant Courses: ..."]). NEVER output a single string.
    - Output MUST be ONLY valid JSON matching this exact schema:
    {
      "matchAnalysis": { "matchScore": 0, "isRelevant": true, "jobLevel": "string", "keywordMatch": "string", "breakdown": { "skills": { "score": 0, "weight": 0 }, "experience": { "score": 0, "weight": 0 }, "education": { "score": 0, "weight": 0 }, "keywords": { "score": 0, "weight": 0 } }, "missingSkillsDetails": { "critical": ["string"], "niceToHave": ["string"] }, "suggestedAdditions": [{ "skill": "string", "reason": "string" }], "structuredFeedback": { "summary": "string", "strengths": ["string"], "improvements": ["string"] } },
      "labels": { "dob": "string", "portfolio": "string", "link": "string", "phone": "string", "email": "string", "location": "string" },
      "sectionTitles": { "summary": "string", "experience": "string", "projects": "string", "education": "string", "skills": "string", "certifications": "string", "awards": "string", "activities": "string", "references": "string", "hobbies": "string", "customSections": "string" },
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
      "hobbies": ["string"],
      "customSections": [{ "title": "string", "items": ["string"] }]
    }

    --- JOB DESCRIPTION ---
    ${jobDescription}

    ${candidateContext}
  `;
}
