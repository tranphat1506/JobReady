// @ts-nocheck
import { ICoverLetterTemplate } from './core/ICoverLetterTemplate';
import { StandardCoverLetterTemplate } from './templates/StandardCoverLetterTemplate';
import { CoverLetterSchema } from '@cv-generator/schema';
import { renderToFile } from '@react-pdf/renderer';

class CoverLetterRegistryClass {
  private templates: Map<string, ICoverLetterTemplate> = new Map();

  constructor() {
    this.register(new StandardCoverLetterTemplate());
  }

  register(template: ICoverLetterTemplate) {
    this.templates.set(template.config.id, template);
  }

  getTemplate(id: string): ICoverLetterTemplate {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Cover Letter template with id '${id}' not found in registry.`);
    }
    return template;
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

export const CoverLetterRegistry = new CoverLetterRegistryClass();

export const generateCoverLetterPdfFile = async (data: CoverLetterSchema, filePath: string, templateId: string = 'standard-cover-letter'): Promise<void> => {
  const template = CoverLetterRegistry.getTemplate(templateId);
  const document = template.render(data);
  await renderToFile(document, filePath);
};
