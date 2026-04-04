import { cn } from '../lib/utils';

const tabs = [
  { id: 'home', label: 'Home', icon: '\u2302' },
  { id: 'library', label: 'Library', icon: '\u266B' },
  { id: 'setlists', label: 'Setlists', icon: '\u2630' },
  { id: 'settings', label: 'Settings', icon: '\u2699' },
];

export default function BottomNav({ activeView, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-md border-t border-accents-2 flex pb-[env(safe-area-inset-bottom,0px)]">
      {tabs.map(t => {
        const active = activeView === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center h-14 gap-1 transition-colors border-none bg-transparent cursor-pointer",
              active ? "text-foreground" : "text-accents-4 hover:text-accents-6"
            )}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            <span className={cn(
              "text-[10px] uppercase font-bold tracking-widest",
              active ? "font-bold" : "font-semibold"
            )}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
