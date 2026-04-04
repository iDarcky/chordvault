import { cn } from '../lib/utils';

const tabs = [
  { id: 'home', label: 'Home', icon: 'M12 3L4 9v12h5v-7h6v7h5V9l-8-6z' },
  { id: 'library', label: 'Library', icon: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'setlists', label: 'Setlists', icon: 'M4 6h16M4 12h16M4 18h16' },
  { id: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z' },
];

export default function BottomNav({ activeView, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-background/70 backdrop-blur-xl border-t border-accents-2 flex pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      {tabs.map(t => {
        const active = activeView === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center h-16 gap-1.5 transition-all border-none bg-transparent cursor-pointer group active:scale-90",
              active ? "text-foreground" : "text-accents-3 hover:text-accents-5"
            )}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={active ? "2.5" : "2"}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("transition-transform group-hover:-translate-y-0.5", active ? "scale-110" : "")}
            >
              <path d={t.icon} />
            </svg>
            <span className={cn(
              "text-[9px] uppercase font-black tracking-[0.2em] transition-all",
              active ? "opacity-100 translate-y-0" : "opacity-60 scale-95"
            )}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
