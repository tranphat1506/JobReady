import React from 'react';
import { CVSchema } from '@cv-generator/schema';
import {
  HTMLATSSimpleHeader,
  HTMLSummaryBlock,
  HTMLEducationBlock,
  HTMLExperienceBlock,
  HTMLProjectsBlock,
  HTMLSkillsBlock,
  HTMLCertificationsBlock,
  HTMLAwardsBlock,
  HTMLActivitiesBlock,
  HTMLLanguagesBlock,
  HTMLReferencesBlock,
  HTMLHobbiesBlock,
  HTMLCustomSectionsBlock
} from './HTMLBlocks';

interface Props {
  data: CVSchema;
  activeBlock: string | null;
  onBlockClick: (id: string) => void;
}

export function HTMLATSSimpleTemplate({ data, activeBlock, onBlockClick }: Props) {
  const t = data.sectionTitles || {} as any;
  const layout = (data as any).layout || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'awards', 'activities', 'languages', 'references', 'hobbies', 'customSections'];

  return (
    <div className="w-full h-full bg-white text-black font-['Lora',serif] text-[10pt] leading-[1.2] p-12 box-border">

      {/* HEADER */}
      <HTMLATSSimpleHeader data={data.personal || {}} activeBlock={activeBlock} onBlockClick={onBlockClick} />

      {/* SECTIONS */}
      {layout.map((sectionId: string) => {
        switch (sectionId) {
          case 'summary':
            return <HTMLSummaryBlock key={sectionId} title={t.summary} data={data.summary} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'education':
            return <HTMLEducationBlock key={sectionId} title={t.education} data={data.education} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'experience':
            return <HTMLExperienceBlock key={sectionId} title={t.experience} data={data.experience} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'projects':
            return <HTMLProjectsBlock key={sectionId} title={t.projects} data={data.projects} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'skills':
            return <HTMLSkillsBlock key={sectionId} title={t.skills} data={data.skills} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'certifications':
            return <HTMLCertificationsBlock key={sectionId} title={t.certifications} data={data.certifications} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'awards':
            return <HTMLAwardsBlock key={sectionId} title={t.awards} data={data.awards} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'activities':
            return <HTMLActivitiesBlock key={sectionId} title={t.activities} data={data.activities} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'languages':
            return <HTMLLanguagesBlock key={sectionId} title={t.languages || 'Languages'} data={data.languages} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'references':
            return <HTMLReferencesBlock key={sectionId} title={t.references} data={data.references} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'hobbies':
            return <HTMLHobbiesBlock key={sectionId} title={t.hobbies} data={data.hobbies} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          case 'customSections':
            return <HTMLCustomSectionsBlock key={sectionId} data={data.customSections} activeBlock={activeBlock} onBlockClick={onBlockClick} />;
          default:
            return null;
        }
      })}

    </div>
  );
}
