import React from 'react';
import { EditableBlock } from './EditableBlock';

// Helper for strings
const isValid = (str?: string) => str && str.trim() !== '' && str.trim().toUpperCase() !== 'N/A';

// --- Shared Styles (Tailwind Mapping) ---
const s = {
  header: "flex flex-col items-center mb-[15px]",
  name: "text-[20px] font-bold uppercase mb-1",
  contactInfo: "text-[10px] flex flex-row justify-center flex-wrap gap-2",
  sectionTitleContainer: "border-b-[0.5px] border-black mb-2 mt-2.5 pb-1",
  sectionTitleText: "text-[13px] font-bold uppercase",
  itemContainer: "mb-1.5",
  itemHeader: "flex flex-row justify-between font-bold",
  itemSubHeader: "flex flex-row justify-between italic mb-0.75",
  bulletPoint: "flex flex-row pl-2.5 mb-0.5",
  bulletDot: "w-2.5 shrink-0",
  bulletText: "flex-1 text-justify",
  summary: "mb-2.5 text-justify",
  link: "text-black no-underline",
};

// --- Blocks ---

export const HTMLHeader = ({ data, activeBlock, onBlockClick }: any) => {
  const contacts: string[] = [];
  if (isValid(data.phone)) contacts.push(data.phone);
  if (isValid(data.email)) contacts.push(data.email);
  if (isValid(data.location)) contacts.push(data.location);
  if (isValid(data.portfolio)) contacts.push(data.portfolio);
  if (data.links) {
    data.links.forEach((l: any) => {
      if (isValid(l.url)) contacts.push(l.url.replace(/^https?:\/\/(www\.)?/, ''));
    });
  }

  return (
    <EditableBlock id="personal" isActive={activeBlock === 'personal'} onClick={onBlockClick}>
      <div className={s.header}>
        <div className={s.name}>{data.fullName || 'YOUR NAME'}</div>
        {isValid(data.jobTitle) && <div className="text-[12px] mb-0.75">{data.jobTitle}</div>}
        <div className={s.contactInfo}>
          {contacts.map((c, i) => (
            <React.Fragment key={i}>
              <span>{c}</span>
              {i < contacts.length - 1 && <span>•</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </EditableBlock>
  );
};

export const HTMLATSSimpleHeader = ({ data, activeBlock, onBlockClick }: any) => {
  const contacts = [];
  if (isValid(data.phone)) contacts.push({ label: 'Phone', value: data.phone });
  if (isValid(data.email)) contacts.push({ label: 'Email', value: data.email });
  if (isValid(data.location)) contacts.push({ label: 'Location', value: data.location });
  
  return (
    <EditableBlock id="personal" isActive={activeBlock === 'personal'} onClick={onBlockClick}>
      <div className="flex flex-row mb-5 items-center border-b-2 border-black pb-3.75">
        <div className="flex-1">
          <div className="text-[24px] font-bold uppercase mb-1">{data.fullName || 'YOUR NAME'}</div>
          {isValid(data.jobTitle) && <div className="text-[12px] text-zinc-600 font-medium">{data.jobTitle}</div>}
        </div>
        <div className="text-[10px] flex flex-col items-end gap-0.5">
          {contacts.map((c, i) => (
            <div key={i}><span className="font-bold">{c.label}:</span> {c.value}</div>
          ))}
        </div>
      </div>
    </EditableBlock>
  );
};

export const HTMLSummaryBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!isValid(data)) return null;
  return (
    <EditableBlock id="summary" isActive={activeBlock === 'summary'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Summary'}</div>
      </div>
      <div className={s.summary}>{data}</div>
    </EditableBlock>
  );
};

export const HTMLEducationBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="education" isActive={activeBlock === 'education'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Education'}</div>
      </div>
      {data.map((edu: any, i: number) => (
        <div key={i} className={s.itemContainer}>
          <div className={s.itemHeader}>
            <span>{edu.institution}</span>
            <span>{edu.startDate} - {edu.endDate || 'Present'}</span>
          </div>
          <div className={s.itemSubHeader}>
            <span>{edu.degree}</span>
          </div>
        </div>
      ))}
    </EditableBlock>
  );
};

export const HTMLExperienceBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="experience" isActive={activeBlock === 'experience'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Experience'}</div>
      </div>
      {data.map((exp: any, i: number) => (
        <div key={i} className={s.itemContainer}>
          <div className={s.itemHeader}>
            <span>{exp.company}</span>
            <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
          </div>
          <div className={s.itemSubHeader}>
            <span>{exp.position}</span>
          </div>
          {exp.description && exp.description.map((desc: string, j: number) => (
            <div key={j} className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{desc}</div>
            </div>
          ))}
        </div>
      ))}
    </EditableBlock>
  );
};

export const HTMLProjectsBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="projects" isActive={activeBlock === 'projects'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Projects'}</div>
      </div>
      {data.map((proj: any, i: number) => (
        <div key={i} className={s.itemContainer}>
          <div className={s.itemHeader}>
            <span>
              {proj.name}
              {proj.links && proj.links.length > 0 && ` - ${proj.links[0].url.replace(/^https?:\/\/(www\.)?/, '')}`}
            </span>
            <span>{proj.startDate} - {proj.endDate || 'Present'}</span>
          </div>
          <div className={s.itemSubHeader}>
            <span>{proj.role}</span>
          </div>
          {proj.description && proj.description.map((desc: string, j: number) => (
            <div key={j} className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{desc}</div>
            </div>
          ))}
        </div>
      ))}
    </EditableBlock>
  );
};

export const HTMLSkillsBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="skills" isActive={activeBlock === 'skills'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Skills'}</div>
      </div>
      <div className="flex flex-col gap-0.5">
        {data.map((skill: any, i: number) => (
          <div key={i} className="flex flex-row text-justify">
            <span className="font-bold w-[25%] shrink-0">{skill.category}:</span>
            <span className="flex-1">{skill.items.join(', ')}</span>
          </div>
        ))}
      </div>
    </EditableBlock>
  );
};

export const HTMLCertificationsBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="certifications" isActive={activeBlock === 'certifications'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Certifications'}</div>
      </div>
      {data.map((cert: any, i: number) => (
        <div key={i} className={s.itemContainer}>
          <div className="flex flex-row justify-between">
            <div>
              <span className="font-bold">{cert.name}</span>
              {cert.issuer && <span className="italic"> - {cert.issuer}</span>}
            </div>
            <span className="font-bold">{cert.date}</span>
          </div>
        </div>
      ))}
    </EditableBlock>
  );
};

export const HTMLAwardsBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="awards" isActive={activeBlock === 'awards'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Awards'}</div>
      </div>
      {data.map((award: any, i: number) => (
        <div key={i} className={s.itemContainer}>
          <div className="flex flex-row justify-between font-bold">
            <span>{award.title}</span>
            <span>{award.date}</span>
          </div>
          {award.issuer && <div className="italic">{award.issuer}</div>}
        </div>
      ))}
    </EditableBlock>
  );
};

export const HTMLActivitiesBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="activities" isActive={activeBlock === 'activities'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Activities'}</div>
      </div>
      {data.map((act: any, i: number) => (
        <div key={i} className={s.itemContainer}>
          <div className={s.itemHeader}>
            <span>{act.organization}</span>
            <span>{act.startDate} - {act.endDate || 'Present'}</span>
          </div>
          {act.role && <div className="italic mb-0.75">{act.role}</div>}
          {act.description && act.description.map((desc: string, j: number) => (
            <div key={j} className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{desc}</div>
            </div>
          ))}
        </div>
      ))}
    </EditableBlock>
  );
};
