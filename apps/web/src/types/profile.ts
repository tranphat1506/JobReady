import { z } from 'zod';

export const LinkSchema = z.object({
  name: z.string(),
  url: z.string().url({ message: 'Invalid URL' }).or(z.literal('')),
});

export const MasterSkillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Required' }),
});

export const LinkedRoleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: 'Required' }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

export const MasterProfileSchema = z.object({
  personal: z.object({
    fullName: z.string().min(1, { message: 'Required' }),
    jobTitle: z.string().optional(),
    gender: z.string().optional(),
    avatar: z.string().optional(),
    dob: z.string().optional(),
    email: z.string().email({ message: 'Invalid email' }),
    phone: z.string().optional(),
    location: z.string().optional(),
    portfolio: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
    links: z.array(LinkSchema).optional(),
  }),
  careerGoals: z.string().optional(),
  skills: z.array(MasterSkillSchema).default([]),
  experience: z.array(
    z.object({
      id: z.string().optional(),
      companyName: z.string().min(1, { message: 'Required' }),
      roles: z.array(LinkedRoleSchema).min(1, { message: 'At least one role required' }),
      appliedSkills: z.array(z.string()).optional(),
    })
  ).optional(),
  projects: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, { message: 'Required' }),
      role: z.string().optional(),
      links: z.array(LinkSchema).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      appliedSkills: z.array(z.string()).optional(),
    })
  ).optional(),
  education: z.array(
    z.object({
      id: z.string().optional(),
      institution: z.string().min(1, { message: 'Required' }),
      degree: z.string().min(1, { message: 'Required' }),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  languages: z.array(
    z.object({
      id: z.string().optional(),
      language: z.string().min(1, { message: 'Required' }),
      proficiency: z.string().optional(),
    })
  ).optional(),
  certifications: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, { message: 'Required' }),
      issuer: z.string().optional(),
      date: z.string().optional(),
    })
  ).optional(),
  awards: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, { message: 'Required' }),
      issuer: z.string().optional(),
      date: z.string().optional(),
    })
  ).optional(),
  activities: z.array(
    z.object({
      id: z.string().optional(),
      organization: z.string().min(1, { message: 'Required' }),
      role: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  references: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, { message: 'Required' }),
      position: z.string().optional(),
      company: z.string().optional(),
      contactInfo: z.string().optional(),
    })
  ).optional(),
  hobbies: z.string().optional(),
});

export type MasterProfileData = z.infer<typeof MasterProfileSchema>;

export const defaultProfileData: MasterProfileData = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    portfolio: '',
    jobTitle: '',
    links: [],
  },
  careerGoals: '',
  skills: [],
  experience: [],
  projects: [],
  education: [],
  languages: [],
  certifications: [],
  awards: [],
  activities: [],
  references: [],
  hobbies: '',
};
