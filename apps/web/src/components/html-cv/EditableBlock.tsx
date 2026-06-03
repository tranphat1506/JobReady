import React from 'react';

export function EditableBlock({ id, isActive, onClick, children }: any) {
  return (
    <div 
      className={`relative group cursor-pointer transition-colors p-1 -m-1 rounded-md ${isActive ? 'bg-blue-50/50 ring-2 ring-blue-400' : 'hover:bg-zinc-50'}`}
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
    >
      {children}
      {isActive && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-bl-md">ĐANG SỬA</div>
      )}
    </div>
  );
}
