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
    <div className="w-full h-full bg-white text-black p-12 font-['Lora',serif] text-[12px] leading-snug">
      <EditableBlock id="personal" isActive={activeBlock === 'personal'} onClick={onBlockClick}>
        <div className="mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase mb-1">{personal.fullName || 'YOUR NAME'}</h1>
          <div className="text-[11px] text-zinc-600">
            {[personal.email, personal.phone, personal.location].filter(isValid).join(' • ')}
          </div>
        </div>
      </EditableBlock>
      <EditableBlock id="recipient" isActive={activeBlock === 'recipient'} onClick={onBlockClick}>
        <div className="mb-4">
          <div>{data.date}</div>
          <div className="mt-4 font-bold">{recipient.name}</div>
          {recipient.company && <div>{recipient.company}</div>}
        </div>
      </EditableBlock>
      <EditableBlock id="opening" isActive={activeBlock === 'opening'} onClick={onBlockClick}>
        <div className="mb-4 text-justify">{data.opening}</div>
      </EditableBlock>
      <EditableBlock id="body" isActive={activeBlock === 'body'} onClick={onBlockClick}>
        <div className="mb-4 text-justify whitespace-pre-wrap">
          {(data.bodyParagraphs || []).map((para, i) => (
            <div key={i} className="mb-2.5">{para}</div>
          ))}
        </div>
      </EditableBlock>
      <EditableBlock id="closing" isActive={activeBlock === 'closing'} onClick={onBlockClick}>
        <div className="mb-4 text-justify">{data.closing}</div>
      </EditableBlock>
      <EditableBlock id="signOff" isActive={activeBlock === 'signOff'} onClick={onBlockClick}>
        <div className="mt-8">
          {(((data as any).signOff) || 'Sincerely,').split('\n').map((line: string, i: number) => (
            <div key={i} className={i === 0 ? "mb-10" : "mb-1"}>{line}</div>
          ))}
        </div>
      </EditableBlock>
    </div>
  );
}
