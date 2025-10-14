
import React from 'react';
import { LogoIcon } from './icons';

export default function Header(): React.ReactElement {
  return (
    <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <LogoIcon />
            <h1 className="text-2xl font-bold text-white ml-3">DocuFlow AI</h1>
          </div>
          <div className="text-sm text-slate-400">Smart Document Workflows</div>
        </div>
      </div>
    </header>
  );
}
