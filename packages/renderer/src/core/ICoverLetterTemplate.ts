import React from 'react';
import { CoverLetterSchema } from '@cv-generator/schema';

export interface CoverLetterTemplateConfig {
  id: string;
  name: string;
}

export interface ICoverLetterTemplate {
  config: CoverLetterTemplateConfig;
  render(data: CoverLetterSchema): React.ReactElement;
}
