import React from 'react';

export default function PageHeader({ title, children }) {
  return (
    <header className="px-6 pt-6 pb-3 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {children && (
        <div className="flex gap-2 items-center">
          {children}
        </div>
      )}
    </header>
  );
}
