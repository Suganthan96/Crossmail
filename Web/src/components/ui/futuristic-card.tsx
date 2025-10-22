'use client';

import React from 'react';

interface ModernCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: string;
  popular?: boolean;
}

const ModernCard = ({ title, subtitle, children, footer, popular = false }: ModernCardProps) => {
  return (
    <div className="group relative w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 p-[1px] shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[rgb(0,210,242)]/25">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgb(0,210,242)] to-blue-500 opacity-20" />
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 p-6">
          <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-[rgb(0,210,242)]/20 to-blue-500/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70" />
          <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/20 to-[rgb(0,210,242)]/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70" />
          
          {popular && (
            <div className="absolute -right-[1px] -top-[1px] overflow-hidden rounded-tr-2xl">
              <div className="absolute h-20 w-20 bg-gradient-to-r from-[rgb(0,210,242)] to-blue-500" />
              <div className="absolute h-20 w-20 bg-slate-950/90" />
              <div className="absolute right-0 top-[22px] h-[2px] w-[56px] rotate-45 bg-gradient-to-r from-[rgb(0,210,242)] to-blue-500" />
              <span className="absolute right-1 top-1 text-[10px] font-semibold text-white">POPULAR</span>
            </div>
          )}
          
          <div className="relative">
            <h3 className="text-sm font-medium uppercase tracking-wider text-[rgb(0,210,242)]">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="relative mt-6">
            {children}
          </div>
          
          {footer && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-400">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium text-slate-400">{footer}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Feature Item Component for easy reuse
export const FeatureItem = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgb(0,210,242)]/10">
      <svg stroke="currentColor" viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[rgb(0,210,242)]">
        <path d="M5 13l4 4L19 7" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
    <div>
  <p className="text-sm font-medium text-black">{title}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  </div>
);

export default ModernCard;