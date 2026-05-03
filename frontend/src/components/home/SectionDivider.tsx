import React from 'react';

export const SectionDivider: React.FC = () => (
  <div className="flex items-center justify-center py-2 px-4 md:px-8">
    <div className="flex items-center gap-3 w-full max-w-5xl">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4500]/40 to-[#FF4500]/60" />
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FF4500]/40" />
        <div className="w-2 h-2 rounded-full bg-[#FF4500]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#FF4500]/40" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#FF4500]/40 to-[#FF4500]/60" />
    </div>
  </div>
);
