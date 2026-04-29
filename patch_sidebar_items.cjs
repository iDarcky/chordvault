const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');

// The nav item buttons currently have 'hover:bg-[var(--ds-gray-200)]' and 'bg-[var(--ds-teal-100)]' for active.
// In Notion, they use more subtle hover effects and selected states with an icon.

content = content.replace(
  /bg-\[var\(--ds-teal-100\)\] text-\[var\(--ds-teal-900\)\]/g,
  'bg-[var(--ds-gray-200)] text-[var(--ds-gray-1000)] font-semibold'
);

content = content.replace(
  /bg-transparent text-\[var\(--ds-gray-700\)\] hover:bg-\[var\(--ds-gray-200\)\] hover:text-\[var\(--ds-gray-1000\)\]/g,
  'bg-transparent text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)]'
);

// We can also adjust the profile button which uses teal currently for active:
content = content.replace(
  /activeView === 'account'\n              \? 'bg-\[var\(--ds-teal-100\)\]'\n              : 'hover:bg-\[var\(--ds-gray-200\)\]'/g,
  "activeView === 'account'\n              ? 'bg-[var(--ds-gray-200)]'\n              : 'hover:bg-[var(--ds-gray-200)]'"
);

fs.writeFileSync('src/components/Sidebar.jsx', content);
