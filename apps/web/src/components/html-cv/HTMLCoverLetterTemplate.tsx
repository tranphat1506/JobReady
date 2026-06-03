import React from 'react';
import { CoverLetterSchema } from '@cv-generator/schema';
import { EditableBlock } from './EditableBlock';

interface Props {
  data: CoverLetterSchema;
  activeBlock: string | null;
  onBlockClick: (id: string) => void;
}

export function HTMLCoverLetterTemplate({ data, activeBlock, onBlockClick }: Props) {
  const personal = data.personal || {} as any;
  const recipient = data.recipient || {} as any;
  const isValid = (str?: string) => str && str.trim() !== '' && str.trim().toUpperCase() !== 'N/A';
  
  return (
    <div className="w-full h-full bg-white text-black p-[40pt] font-['Lora',serif] text-[11pt] leading-[1.5] box-border">
      <EditableBlock id="personal" isActive={activeBlock === 'personal'} onClick={onBlockClick}>
        <div className="mb-[20pt]">
          <div className="flex flex-col justify-center min-h-[30pt]">
            <h1 className="text-[20pt] font-bold uppercase mb-[5pt]">{personal.fullName || 'YOUR NAME'}</h1>
          </div>
          {isValid(personal.jobTitle) && (
            <div className="min-h-[18pt] mb-[5pt] flex flex-col justify-center">
              <div className="text-[12pt] text-[#555]">{personal.jobTitle}</div>
            </div>
          )}
          <div className="text-[10pt] text-[#333] leading-[1.5]">
            {isValid(personal.phone) && <div>{personal.phone}</div>}
            {isValid(personal.email) && <div>{personal.email}</div>}
            {isValid(personal.location) && <div>{personal.location}</div>}
            {isValid(personal.portfolio) && <div>{personal.portfolio}</div>}
          </div>
        </div>
      </EditableBlock>
      <EditableBlock id="recipient" isActive={activeBlock === 'recipient'} onClick={onBlockClick}>
        <div className="mb-[20pt]">
          <div className="text-[11pt]">{data.date}</div>
        </div>
        <div className="mb-[20pt]">
          {isValid(recipient.name) && <div className="text-[11pt] font-bold">{recipient.name}</div>}
          {isValid(recipient.title) && <div className="text-[11pt]">{recipient.title}</div>}
          {isValid(recipient.company) && <div className="text-[11pt] font-bold">{recipient.company}</div>}
          {isValid(recipient.address) && <div className="text-[11pt]">{recipient.address}</div>}
        </div>
      </EditableBlock>
      <EditableBlock id="opening" isActive={activeBlock === 'opening'} onClick={onBlockClick}>
        <div className="mb-[15pt] text-[11pt]">{data.salutation}</div>
      </EditableBlock>
      <EditableBlock id="body" isActive={activeBlock === 'body'} onClick={onBlockClick}>
        <div className="mb-[15pt] text-[11pt] text-justify">
          <div className="mb-[10pt]">{data.opening}</div>
          {(data.bodyParagraphs || []).map((para, i) => (
            <div key={i} className="mb-[10pt]">{para}</div>
          ))}
          <div>{data.closing}</div>
        </div>
      </EditableBlock>
      <EditableBlock id="signOff" isActive={activeBlock === 'signOff'} onClick={onBlockClick}>
        <div className="mt-[20pt] text-[11pt]">
          {(((data as any).signOff) || 'Sincerely,').split('\n').map((line: string, i: number) => (
            <div key={i} className={i === 0 ? "mb-[40pt]" : "mb-[4pt]"}>{line}</div>
          ))}
        </div>
      </EditableBlock>
    </div>
  );
}
