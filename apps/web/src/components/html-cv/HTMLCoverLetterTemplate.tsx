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
    <div className="w-full h-full bg-white text-black p-[40pt] font-['Lora',serif] text-[11pt] leading-normal box-border">
      <EditableBlock id="personal" isActive={activeBlock === 'personal'} onClick={onBlockClick}>
        <div className="mb-[20pt] flex items-start gap-4">
          {personal.avatar && personal.showAvatar !== false && (
            <img
              src={personal.avatar}
              alt="Avatar"
              className="w-[4cm] h-[6cm] object-cover rounded-sm shrink-0"
            />
          )}
          <div className="flex flex-col justify-center min-h-10 flex-1">
            <h1 className="text-[20pt] font-bold uppercase mb-[5pt]">{personal.fullName || 'YOUR NAME'}</h1>
            {isValid(personal.jobTitle) && (
              <div className="min-h-6 mb-[5pt] flex flex-col justify-center">
                <div className="text-[12pt] text-[#555]">{personal.jobTitle}</div>
              </div>
            )}
            <div className="text-[10pt] text-[#333] leading-normal">
              {isValid(personal.phone) && <div>{personal.phone}</div>}
              {isValid(personal.email) && <div>{personal.email}</div>}
              {isValid(personal.location) && <div>{personal.location}</div>}
              {isValid(personal.portfolio) && <div>{personal.portfolio}</div>}
            </div>
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
      <EditableBlock id="salutation" isActive={activeBlock === 'salutation'} onClick={onBlockClick}>
        <div className="mb-5 text-[11pt]">{data.salutation}</div>
      </EditableBlock>
      <EditableBlock id="body" isActive={activeBlock === 'body'} onClick={onBlockClick}>
        <div className="mb-5 text-[11pt] text-justify">
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
