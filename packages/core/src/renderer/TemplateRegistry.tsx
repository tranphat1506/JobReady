import { ITemplate } from './core/ITemplate';
import { HarvardTemplate } from './templates/HarvardTemplate';
import { ATSSimpleTemplate } from './templates/ATSSimpleTemplate';
import { CVSchema } from '../types/schema';
import { renderToFile } from '@react-pdf/renderer';

class TemplateRegistryClass {
  private templates: Map<string, ITemplate> = new Map();

  constructor() {
    // Register default templates here
    this.register(new HarvardTemplate());
    this.register(new ATSSimpleTemplate());
  }

  register(template: ITemplate) {
    this.templates.set(template.config.id, template);
  }

  getTemplate(id: string): ITemplate {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template with id '${id}' not found in registry.`);
    }
    return template;
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

export const TemplateRegistry = new TemplateRegistryClass();

/**
 * Backward compatibility or simplified entry point
 */
export const generatePdfFile = async (data: CVSchema, filePath: string, templateId: string = 'harvard'): Promise<void> => {
  const template = TemplateRegistry.getTemplate(templateId);
  const document = template.render(data);
  await renderToFile(document, filePath);
};
