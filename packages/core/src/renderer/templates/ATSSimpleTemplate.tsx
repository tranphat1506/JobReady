import React from 'react';
import { Document, Page, View } from '@react-pdf/renderer';
import { ITemplate, TemplateConfig, SectionType } from '../core/ITemplate';
import { CVSchema } from '../../types/schema';
import { styles } from '../components/Styles';

// Lego blocks
import { ATSSimpleHeader } from '../components/ATSSimpleHeader';
import { SummaryBlock } from '../components/SummaryBlock';
import { EducationBlock } from '../components/EducationBlock';
import { ExperienceBlock } from '../components/ExperienceBlock';
import { ProjectsBlock } from '../components/ProjectsBlock';
import { SkillsBlock } from '../components/SkillsBlock';
import { CertificationsBlock } from '../components/CertificationsBlock';
import { AwardsBlock } from '../components/AwardsBlock';
import { ActivitiesBlock } from '../components/ActivitiesBlock';
import { ReferencesBlock } from '../components/ReferencesBlock';
import { HobbiesBlock } from '../components/HobbiesBlock';

export class ATSSimpleTemplate implements ITemplate {
  config: TemplateConfig = {
    id: 'ats-simple',
    name: 'ATS Simple',
    defaultLayout: ['summary', 'education', 'experience', 'projects', 'certifications', 'awards', 'activities', 'skills', 'references', 'hobbies']
  };

  private renderSection(type: SectionType, data: CVSchema, index: number) {
    const t = data.sectionTitles || {} as any;

    switch (type) {
      case 'summary':
        return <SummaryBlock key={index} title={t.summary || 'Summary'} data={data.summary} />;
      case 'education':
        return <EducationBlock key={index} title={t.education || 'Education'} data={data.education} />;
      case 'experience':
        return <ExperienceBlock key={index} title={t.experience || 'Experience'} data={data.experience} />;
      case 'projects':
        return <ProjectsBlock key={index} title={t.projects || 'Projects'} data={data.projects || []} labels={data.labels} />;
      case 'skills':
        return <SkillsBlock key={index} title={t.skills || 'Skills'} data={data.skills} />;
      case 'certifications':
        return <CertificationsBlock key={index} title={t.certifications || 'Certifications'} data={data.certifications || []} />;
      case 'awards':
        return <AwardsBlock key={index} title={t.awards || 'Awards'} data={data.awards || []} />;
      case 'activities':
        return <ActivitiesBlock key={index} title={t.activities || 'Activities'} data={data.activities || []} />;
      case 'references':
        return <ReferencesBlock key={index} title={t.references || 'References'} data={data.references || []} />;
      case 'hobbies':
        return <HobbiesBlock key={index} title={t.hobbies || 'Hobbies'} data={data.hobbies || []} />;
      default:
        return null;
    }
  }

  render(data: CVSchema, customLayout?: SectionType[]): React.ReactElement {
    const layout = customLayout || this.config.defaultLayout;

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <ATSSimpleHeader data={data.personal} labels={data.labels} />

          <View style={{ marginTop: 10 }}>
            {layout.map((section, index) => this.renderSection(section, data, index))}
          </View>
        </Page>
      </Document>
    );
  }
}
