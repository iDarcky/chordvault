const fs = require('fs');

let content = fs.readFileSync('src/components/TopHeader.jsx', 'utf8');

// The Settings button doesn't have an onClick!
// It should be:
//           <button
//             onClick={() => openSettings('settings')}
//             className={cx(...)}
//             title="Settings"
//           >
content = content.replace(
  /className=\{cx\(\n\s*"flex items-center justify-center p-2 rounded-full transition-colors cursor-pointer border-none bg-transparent",\n\s*activeView === 'settings'\n\s*\? "text-\[var\(--ds-gray-1000\)\] bg-\[var\(--ds-gray-200\)\]"\n\s*: "text-\[var\(--ds-gray-600\)\] hover:text-\[var\(--ds-gray-900\)\] hover:bg-\[var\(--ds-gray-200\)\]"\n\s*\)\}/g,
  `onClick={() => onSettingsClick('settings')}
            className={cx(
              "flex items-center justify-center p-2 rounded-full transition-colors cursor-pointer border-none bg-transparent",
              activeView === 'settings'
                ? "text-[var(--ds-gray-1000)] bg-[var(--ds-gray-200)]"
                : "text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-200)]"
            )}`
);

fs.writeFileSync('src/components/TopHeader.jsx', content, 'utf8');
