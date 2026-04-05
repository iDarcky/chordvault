import { cn } from '../lib/utils';

export default function PageHeader({ title, children, className }) {
  return (
    <header className={cn(
      "px-6 pt-6 pb-3 flex items-center justify-between sticky top-0 z-50 bg-[var(--geist-background)]/80 backdrop-blur-md border-b border-transparent",
      className
    )}>
      <h1 className="text-xl font-bold text-[var(--geist-foreground)] tracking-tight">
        {title}
      </h1>
      {children && (
        <div className="flex items-center gap-1.5">
          {children}
        </div>
      )}
    </header>
  );
}
