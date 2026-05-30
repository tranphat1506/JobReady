export interface Link {
  name: string;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  jobTitle?: string;
  gender?: string;
  avatar?: string;
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

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
}

export interface Award {
  title: string;
  issuer?: string;
  date?: string;
}

export interface Activity {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description?: string[];
}

export interface Reference {
  name: string;
  position: string;
  company: string;
  contactInfo: string;
}

export interface SectionTitles {
  summary: string;
  experience: string;
  projects: string;
  education: string;
  skills: string;
  certifications?: string;
  awards?: string;
  activities?: string;
  references?: string;
  hobbies?: string;
}

export interface MatchAnalysis {
  matchScore: number;
  isRelevant: boolean;
  missingSkills: string[];
  feedback: string;
}

export interface Labels {
  dob: string;
  portfolio: string;
  link: string;
  phone?: string;
  email?: string;
  location?: string;
}

export interface CVSchema {
  matchAnalysis?: MatchAnalysis;
  labels: Labels;
  sectionTitles: SectionTitles;
  personal: PersonalInfo;
  summary: string;
  experience: Experience[];
  projects?: Project[];
  education: Education[];
  skills: SkillCategory[];
  certifications?: Certification[];
  awards?: Award[];
  activities?: Activity[];
  references?: Reference[];
  hobbies?: string[];
}
