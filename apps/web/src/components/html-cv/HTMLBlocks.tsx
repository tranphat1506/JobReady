import React from 'react';
import { EditableBlock } from './EditableBlock';

// Helper for strings
const isValid = (str?: string) => str && str.trim() !== '' && str.trim().toUpperCase() !== 'N/A';

// --- Shared Styles (Exact pt Mapping from React-PDF) ---
const s = {
  header: "flex flex-col items-center mb-[15pt]",
  name: "text-[20pt] font-bold uppercase mb-[5pt]",
  contactInfo: "text-[10pt] flex flex-row justify-center flex-wrap gap-[8pt]",
  sectionTitleContainer: "border-b-[0.5pt] border-black mb-[8pt] mt-[10pt]",
  sectionTitleText: "text-[13pt] font-bold uppercase mb-[4pt]",
  itemContainer: "mb-[6pt]",
  itemHeader: "flex flex-row justify-between font-bold",
  itemSubHeader: "flex flex-row justify-between italic mb-[3pt]",
  bulletPoint: "flex flex-row pl-[10pt] mb-[2pt]",
  bulletDot: "w-[10pt] shrink-0",
  bulletText: "flex-1 text-justify",
  summary: "mb-[10pt] text-justify",
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
        {isValid(data.jobTitle) && <div className="text-[10pt] mb-[5pt]">{data.jobTitle}</div>}
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
  if (isValid(data.dob)) contacts.push({ label: 'Ngày sinh', value: data.dob });
  if (isValid(data.gender)) contacts.push({ label: 'Giới tính', value: data.gender });
  if (isValid(data.phone)) contacts.push({ label: 'Số điện thoại', value: data.phone });
  if (isValid(data.email)) contacts.push({ label: 'Email', value: data.email });
  if (isValid(data.portfolio)) {
    const cleanUrl = data.portfolio.replace(/^https?:\/\/(www\.)?/, '');
    contacts.push({ label: 'Portfolio', value: cleanUrl });
  }
  if (isValid(data.location)) contacts.push({ label: 'Địa chỉ', value: data.location });

  if (data.links) {
    data.links.forEach((link: any) => {
      if (isValid(link.url) && isValid(link.name)) {
        const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '');
        contacts.push({ label: link.name, value: cleanUrl });
      }
    });
  }

  let avatarSrc = data.avatar;
  if (!isValid(avatarSrc)) {
    avatarSrc = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
  }

  return (
    <EditableBlock id="personal" isActive={activeBlock === 'personal'} onClick={onBlockClick}>
      <div className="flex flex-row mb-[20pt] items-center">
        <div className="w-[100pt] mr-[20pt] shrink-0">
          <img src={avatarSrc} className="w-[100pt] h-[100pt] object-contain" alt="Avatar" />
        </div>
        <div className="flex-1">
          <div className="text-[24pt] font-bold uppercase">{data.fullName || 'YOUR NAME'}</div>
          {isValid(data.jobTitle) ? (
            <div className="text-[13pt] text-[#555] mb-[5pt]">{data.jobTitle}</div>
          ) : <div className="mb-[5pt]" />}
          <div className="text-[10pt] leading-[1.3]">
            {contacts.map((c, i) => (
              <div key={i} className="flex flex-row">
                <span className="w-[80pt] font-bold">{c.label}:</span>
                <span className="flex-1">{c.value}</span>
              </div>
            ))}
          </div>
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
          {edu.description && Array.isArray(edu.description) && edu.description.map((desc: string, j: number) => (
            <div key={j} className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{desc}</div>
            </div>
          ))}
          {edu.description && typeof edu.description === 'string' && (
            <div className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{edu.description}</div>
            </div>
          )}
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
          {exp.description && Array.isArray(exp.description) && exp.description.map((desc: string, j: number) => (
            <div key={j} className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{desc}</div>
            </div>
          ))}
          {exp.description && typeof exp.description === 'string' && (
            <div className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{exp.description}</div>
            </div>
          )}
        </div>
      ))}
    </EditableBlock>
  );
};

export const HTMLProjectsBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  const isValid = (str?: string) => str && str.trim() !== '' && str.trim().toUpperCase() !== 'N/A';
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="projects" isActive={activeBlock === 'projects'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Projects'}</div>
      </div>
      {data.map((proj: any, i: number) => (
        <div key={i} className={s.itemContainer}>
          <div className={s.itemHeader}>
            <span className="flex-1 pr-[10pt]">
              {proj.name} {proj.role ? `(${proj.role})` : '(Project)'}
            </span>
            <span className="shrink-0">{proj.startDate} - {proj.endDate || 'Present'}</span>
          </div>
          {proj.links && proj.links.length > 0 && (
            <div className={s.itemSubHeader}>
              <span>
                {proj.links.map((linkObj: any, index: number) => {
                  if (!isValid(linkObj.url)) return null;
                  const url = linkObj.url.startsWith('http') ? linkObj.url : `https://${linkObj.url}`;
                  const display = linkObj.name ? `${linkObj.name}: ` : '';
                  return (
                    <React.Fragment key={index}>
                      <span>{display}</span>
                      <a href={url} className={s.link}>{linkObj.url.replace(/^https?:\/\/(www\.)?/, '')}</a>
                      {index < proj.links.length - 1 ? <span>  •  </span> : null}
                    </React.Fragment>
                  );
                })}
              </span>
            </div>
          )}
          {proj.description && Array.isArray(proj.description) && proj.description.map((desc: string, j: number) => (
            <div key={j} className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{desc}</div>
            </div>
          ))}
          {proj.description && typeof proj.description === 'string' && (
            <div className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{proj.description}</div>
            </div>
          )}
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
      <div className="flex flex-col">
        {data.map((skill: any, i: number) => (
          <div key={i} className="flex flex-row text-justify">
            <span className="font-bold">{skill.category}: </span>
            <span className="flex-1 ml-[4pt]">{skill.items.join(', ')}</span>
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
              {isValid(cert.issuer) && <span className="italic"> - {cert.issuer}</span>}
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
          {isValid(award.issuer) && <div className="italic">{award.issuer}</div>}
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
          {isValid(act.role) && <div className="italic mb-1">{act.role}</div>}
          {act.description && Array.isArray(act.description) && act.description.map((desc: string, j: number) => (
            <div key={j} className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{desc}</div>
            </div>
          ))}
          {act.description && typeof act.description === 'string' && (
            <div className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{act.description}</div>
            </div>
          )}
        </div>
      ))}
    </EditableBlock>
  );
};

export const HTMLLanguagesBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="languages" isActive={activeBlock === 'languages'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Languages'}</div>
      </div>
      <div className="flex flex-col">
        {data.map((lang: any, i: number) => (
          <div key={i} className="flex flex-row">
            <span className="font-bold w-40">{lang.language}</span>
            {isValid(lang.proficiency) && <span className="flex-1">{lang.proficiency}</span>}
          </div>
        ))}
      </div>
    </EditableBlock>
  );
};

export const HTMLReferencesBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="references" isActive={activeBlock === 'references'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'References'}</div>
      </div>
      <div className="flex flex-wrap">
        {data.map((ref: any, i: number) => (
          <div key={i} className="w-[50%] mb-[10pt] pr-[10pt]">
            <div className="font-bold">{ref.name}</div>
            {isValid(ref.position) && <div className="italic">{ref.position}</div>}
            {isValid(ref.company) && <div>{ref.company}</div>}
            {isValid(ref.contactInfo) && <div>{ref.contactInfo}</div>}
          </div>
        ))}
      </div>
    </EditableBlock>
  );
};

export const HTMLHobbiesBlock = ({ title, data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="hobbies" isActive={activeBlock === 'hobbies'} onClick={onBlockClick}>
      <div className={s.sectionTitleContainer}>
        <div className={s.sectionTitleText}>{title || 'Hobbies'}</div>
      </div>
      <div className="text-justify">
        {data.join(', ')}
      </div>
    </EditableBlock>
  );
};

export const HTMLCustomSectionsBlock = ({ data, activeBlock, onBlockClick }: any) => {
  if (!data || data.length === 0) return null;
  return (
    <EditableBlock id="customSections" isActive={activeBlock === 'customSections'} onClick={onBlockClick}>
      {data.map((sec: any, i: number) => (
        <div key={i} className="mb-5">
          <div className={s.sectionTitleContainer}>
            <div className={s.sectionTitleText}>{sec.title || 'Section'}</div>
          </div>
          {sec.items && sec.items.map((item: string, j: number) => (
            <div key={j} className={s.bulletPoint}>
              <div className={s.bulletDot}>•</div>
              <div className={s.bulletText}>{item}</div>
            </div>
          ))}
        </div>
      ))}
    </EditableBlock>
  );
};
