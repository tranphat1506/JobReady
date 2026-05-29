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

export interface Project {
  name: string;
  link?: string;
  role?: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Education {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface SectionTitles {
  summary: string;
  experience: string;
  projects: string;
  education: string;
  skills: string;
}

export interface CVSchema {
  sectionTitles: SectionTitles;
  personal: PersonalInfo;
  summary: string;
  experience: Experience[];
  projects?: Project[];
  education: Education[];
  skills: SkillCategory[];
}
