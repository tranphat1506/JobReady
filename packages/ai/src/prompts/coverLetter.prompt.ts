/**
 * Prompt builder for parseAndTailorCoverLetter.
 */
export function buildCoverLetterPrompt(
  jobDescription: string,
  rawCV: string,
  targetLanguage: string
): string {
  return `
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
    - Set 'personal.jobTitle' to exactly match the target role title specified in the Job Description, demonstrating alignment.
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
}
