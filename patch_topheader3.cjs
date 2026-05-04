const fs = require('fs');

let content = fs.readFileSync('src/components/TopHeader.jsx', 'utf8');

content = content.replace(
  `          <button
            onClick={() => onNavigate('settings')}
            className={cn(
              "flex items-center justify-center p-2 rounded-full transition-colors cursor-pointer border-none bg-transparent",
              activeView === 'settings'
                ? "text-[var(--ds-gray-1000)] bg-[var(--ds-gray-200)]"
                : "text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-200)]"
            )}
            title="Settings"
          >`,
  `          <button
            onClick={() => onSettingsClick('settings')}
            className={cn(
              "flex items-center justify-center p-2 rounded-full transition-colors cursor-pointer border-none bg-transparent",
              activeView === 'settings'
                ? "text-[var(--ds-gray-1000)] bg-[var(--ds-gray-200)]"
                : "text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-200)]"
            )}
            title="Settings"
          >`
);

fs.writeFileSync('src/components/TopHeader.jsx', content, 'utf8');
