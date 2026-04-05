import { cn } from '../../lib/utils';

export default function Card({
  children,
  className,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[var(--geist-background)] border border-[var(--geist-border)] rounded-geist-card transition-all overflow-hidden',
        onClick && 'cursor-pointer hover:bg-[var(--accents-1)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
