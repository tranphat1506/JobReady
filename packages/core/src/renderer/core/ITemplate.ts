import { CVSchema } from '../../types/schema';
import React from 'react';

export type SectionType = 
  | 'summary'
  | 'education' 
  | 'experience' 
  | 'projects' 
  | 'skills' 
  | 'certifications' 
  | 'awards' 
  | 'activities'
  | 'references'
  | 'hobbies';

export interface TemplateConfig {
  id: string;
  name: string;
  defaultLayout: SectionType[];
}

export interface ITemplate {
  config: TemplateConfig;
  render(data: CVSchema, customLayout?: SectionType[]): React.ReactElement;
}
