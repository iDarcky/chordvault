import React from 'react';
import { Tabs, Tab } from "@heroui/react";

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'library', label: 'Library', icon: '🎵' },
  { id: 'setlists', label: 'Setlists', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function BottomNav({ activeView, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom,0px)] bg-background/80 backdrop-blur-md border-t border-divider h-16">
      <div className="flex w-full h-full">
        {navItems.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-primary' : 'text-default-400 hover:text-default-600'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              {active && <div className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
