import React from 'react';

export const ScreenWrapper = ({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) => (
  <div className="max-w-2xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-zinc-100 font-black uppercase italic">
    <div className="text-center mb-10">
      <h2 className="text-4xl text-orange-500 uppercase tracking-tighter">{title}</h2>
      {subtitle && <p className="text-zinc-500 font-serif normal-case italic">{subtitle}</p>}
    </div>
    {children}
  </div>
);
