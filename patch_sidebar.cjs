const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');

// Update sidebar background to cleaner styling and adjust border if needed.
// Right now it's using bg-[var(--ds-background-200)]
// Also adding a subtle border-r and frosted effect for tablet/desktop if applicable

content = content.replace(
  /className="h-\[100dvh\] hidden sm:flex flex-col bg-\[var\(--ds-background-200\)\] transition-all duration-300 w-\[80px\] xl:w-\[280px\] py-6 px-3 xl:px-4 overflow-hidden overscroll-contain"/g,
  'className="h-[100dvh] hidden sm:flex flex-col bg-[var(--ds-background-100)] border-r border-[var(--ds-gray-200)] transition-all duration-300 w-[80px] xl:w-[260px] py-6 px-3 xl:px-4 overflow-hidden overscroll-contain"'
);

// We're making the sidebar slightly narrower (260px instead of 280px) to match Notion's tighter feel.

fs.writeFileSync('src/components/Sidebar.jsx', content);
