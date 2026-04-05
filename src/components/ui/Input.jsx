import { cn } from '../../lib/utils';

export default function Input({
  className,
  ...props
}) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 text-sm bg-[var(--accents-1)] border border-[var(--geist-border)] rounded-geist-button text-[var(--geist-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--geist-foreground)] transition-all placeholder:text-[var(--accents-4)]',
        className
      )}
      {...props}
    />
  );
}
