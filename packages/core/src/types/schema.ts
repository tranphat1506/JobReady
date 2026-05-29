export interface Link {
  name: string;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  dob?: string;
  email: string;
  phone: string;
  location: string;
  portfolio?: string;
  links: Link[];
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Education {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface CVSchema {
  personal: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: SkillCategory[];
}
