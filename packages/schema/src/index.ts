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

export interface Language {
  language: string;
  proficiency?: string;
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
  languages?: Language[];
  certifications?: Certification[];
  awards?: Award[];
  activities?: Activity[];
  references?: Reference[];
  hobbies?: string[];
}

export interface RecipientInfo {
  name?: string;
  title?: string;
  company?: string;
  address?: string;
}

export interface CoverLetterSchema {
  personal: PersonalInfo;
  recipient: RecipientInfo;
  date: string;
  salutation: string;
  opening: string;
  bodyParagraphs: string[];
  closing: string;
}

export interface MasterSkill {
  id?: string;
  name: string;
}

export interface LinkedRole {
  id?: string;
  title: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface LinkedExperience {
  id?: string;
  companyName: string;
  roles: LinkedRole[];
  appliedSkills?: string[];
  domainTags?: string[];
}

export interface LinkedProject {
  id?: string;
  name: string;
  role?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  appliedSkills?: string[];
  domainTags?: string[];
}

export interface LinkedEducation {
  id?: string;
  institution: string;
  degree: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  domainTags?: string[];
}

export interface LinkedCertification {
  id?: string;
  name: string;
  issuer?: string;
  date?: string;
  domainTags?: string[];
}

export interface LinkedAward {
  id?: string;
  title: string;
  issuer?: string;
  date?: string;
  domainTags?: string[];
}

export interface LinkedActivity {
  id?: string;
  organization: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  domainTags?: string[];
}

export interface TaggedLanguage extends Language { id?: string; tags?: string[]; }
export interface TaggedReference extends Reference { id?: string; tags?: string[]; }

export interface MasterProfileData {
  personal: PersonalInfo;
  careerGoals?: string;
  skills: MasterSkill[];
  experience?: LinkedExperience[];
  projects?: LinkedProject[];
  education?: LinkedEducation[];
  languages?: TaggedLanguage[];
  certifications?: LinkedCertification[];
  awards?: LinkedAward[];
  activities?: LinkedActivity[];
  references?: TaggedReference[];
  hobbies?: string;
}
