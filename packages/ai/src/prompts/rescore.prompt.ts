export function buildRescorePrompt(
  jobDescription: string,
  cvContent: object,
  targetLanguage: string
): string {
  return `
    You are an Expert Recruiter and ATS (Applicant Tracking System) Evaluator.
    Your task is to strictly evaluate the provided CV against the Job Description and return ONLY a JSON object containing the match analysis.
    Do NOT modify or return the CV content. ONLY return the analysis.

    CRITICAL INSTRUCTIONS:
    - Analyze the fit between the Candidate's CV and the Job Description.
    - Translate ALL feedback, reasons, and text inside 'structuredFeedback' strictly into ${targetLanguage}.
    - Output MUST be ONLY valid JSON matching this exact schema:
    {
      "matchScore": 0,
      "isRelevant": true,
      "jobLevel": "string",
      "keywordMatch": "string",
      "breakdown": {
        "skills": { "score": 0, "weight": 0 },
        "experience": { "score": 0, "weight": 0 },
        "education": { "score": 0, "weight": 0 },
        "keywords": { "score": 0, "weight": 0 }
      },
      "missingSkillsDetails": {
        "critical": ["string"],
        "niceToHave": ["string"]
      },
      "suggestedAdditions": [
        { "skill": "string", "reason": "string" }
      ],
      "structuredFeedback": {
        "summary": "string",
        "strengths": ["string"],
        "improvements": ["string"]
      }
    }

    Notes on fields:
    - 'matchScore': 0-100 score indicating how well the candidate fits the role overall.
    - 'isRelevant': true if matchScore >= 40, false otherwise.
    - 'jobLevel': Extracted or assumed job title/level from the JD (e.g., "Senior Backend").
    - 'keywordMatch': Ratio of matched keywords (e.g., "8/14").
    - 'breakdown': Scores (0-100) and weights (0-1) for skills, experience, education, keywords. Ensure weights sum to 1.0.
    - 'missingSkillsDetails': Group missing skills from JD into 'critical' (must-have) and 'niceToHave' (optional).
    - 'suggestedAdditions': Skills the candidate might have based on context but didn't explicitly mention.
    - 'structuredFeedback': 'summary' is a 1-sentence overview. 'strengths' and 'improvements' are arrays of short bullet points.

    --- JOB DESCRIPTION ---
    ${jobDescription}

    --- CANDIDATE CV (JSON) ---
    ${JSON.stringify(cvContent, null, 2)}
  `;
}
