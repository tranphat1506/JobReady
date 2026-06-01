import { z } from 'zod';

export const MasterProfileSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(1, { message: 'Required' }),
    email: z.string().email({ message: 'Invalid email' }),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
    portfolio: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
    summary: z.string().optional(),
  }),
  experience: z.array(
    z.object({
      id: z.string().optional(),
      company: z.string().min(1, { message: 'Required' }),
      role: z.string().min(1, { message: 'Required' }),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  education: z.array(
    z.object({
      id: z.string().optional(),
      school: z.string().min(1, { message: 'Required' }),
      degree: z.string().min(1, { message: 'Required' }),
      field: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  skills: z.array(
    z.object({
      id: z.string().optional(),
      category: z.string().min(1, { message: 'Required' }),
      items: z.string(), // We store as string (comma separated) for easy form input, parse later
    })
  ).optional(),
  languages: z.array(
    z.object({
      id: z.string().optional(),
      language: z.string().min(1, { message: 'Required' }),
      proficiency: z.string().optional(),
    })
  ).optional(),
});

export type MasterProfileData = z.infer<typeof MasterProfileSchema>;

export const defaultProfileData: MasterProfileData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  languages: [],
};
