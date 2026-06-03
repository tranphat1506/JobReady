import { z } from 'zod';

export const LinkSchema = z.object({
  name: z.string().optional().or(z.literal('')),
  url: z.string().optional().or(z.literal('')),
});

export const MasterSkillSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().or(z.literal('')),
});

export const LinkedRoleSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

export const MasterProfileSchema = z.object({
  personal: z.object({
    fullName: z.string().optional().or(z.literal('')),
    jobTitle: z.string().optional(),
    gender: z.string().optional(),
    avatar: z.string().optional(),
    dob: z.string().optional(),
    email: z.string().email({ message: 'Invalid email' }).optional().or(z.literal('')),
    phone: z.string().optional(),
    location: z.string().optional(),
    portfolio: z.string().optional().or(z.literal('')),
    links: z.array(LinkSchema).optional(),
  }),
  careerGoals: z.string().optional(),
  skills: z.array(MasterSkillSchema).default([]),
  experience: z.array(
    z.object({
      id: z.string().optional(),
      companyName: z.string().optional().or(z.literal('')),
      roles: z.array(LinkedRoleSchema).optional(),
      appliedSkills: z.array(z.string()).optional(),
    })
  ).optional(),
  projects: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional().or(z.literal('')),
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
      institution: z.string().optional().or(z.literal('')),
      degree: z.string().optional().or(z.literal('')),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  languages: z.array(
    z.object({
      id: z.string().optional(),
      language: z.string().optional().or(z.literal('')),
      proficiency: z.string().optional(),
    })
  ).optional(),
  certifications: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional().or(z.literal('')),
      issuer: z.string().optional(),
      date: z.string().optional(),
    })
  ).optional(),
  awards: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().optional().or(z.literal('')),
      issuer: z.string().optional(),
      date: z.string().optional(),
    })
  ).optional(),
  activities: z.array(
    z.object({
      id: z.string().optional(),
      organization: z.string().optional().or(z.literal('')),
      role: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  references: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional().or(z.literal('')),
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
