/**
 * Prompt builder for parseMasterProfile.
 * Extracts structured profile data from raw CV text.
 */
export function buildMasterProfilePrompt(rawCV: string): string {
  return `You are an expert HR assistant. Your task is to extract information from the following CV/Profile text and format it STRICTLY as a JSON object that matches this exact TypeScript interface:
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
      appliedSkills?: string[] // Cross-reference skills from the MASTER POOL used in this company
    }>,
    projects?: Array<{
      name: string,
      role?: string,
      links?: Array<{ name: string, url: string }>,
      startDate?: string,
      endDate?: string,
      description?: string,
      appliedSkills?: string[] // Cross-reference skills from the MASTER POOL used in this project
    }>,
    education: Array<{
      institution: string,
      degree: string,
      startDate?: string,
      endDate?: string,
      description?: string
    }>,
    languages?: Array<{
      language: string,
      proficiency?: string
    }>,
    certifications?: Array<{
      name: string,
      issuer?: string,
      date?: string
    }>,
    awards?: Array<{
      title: string,
      issuer?: string,
      date?: string
    }>,
    activities?: Array<{
      organization: string,
      role?: string,
      startDate?: string,
      endDate?: string,
      description?: string
    }>,
    references?: Array<{
      name: string,
      position?: string,
      company?: string,
      contactInfo?: string
    }>,
    hobbies?: string
  }

  CRITICAL INSTRUCTIONS:
  - Return ONLY the raw JSON object.
  - Do not include markdown code blocks like \`\`\`json or \`\`\`.
  - RELATIONAL DATA MODEL: You must extract ALL skills found in the document into the global 'skills' array. Then, for each 'experience' and 'project', figure out which of those skills were used and list their names exactly in the 'appliedSkills' array of that specific experience/project.
  - GROUPING: If a person had multiple roles/promotions at the SAME company, do NOT create separate experience entries. Create ONE experience entry for the company, and put all the roles into the 'roles' array.
  - For projects: if there are links (GitHub, website, demo), put them in 'links' as an array of { name, url }.
  - If some information is missing, leave it as an empty string or omit optional fields.

  Here is the CV text to parse:
  ---
  ${rawCV}
  ---`;
}
