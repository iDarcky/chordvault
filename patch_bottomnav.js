const fs = require('fs');

let content = fs.readFileSync('src/components/BottomNav.jsx', 'utf8');

// Update styling to add frosted glass effect to the bottom nav
content = content.replace(
  /className="fixed bottom-0 left-0 right-0 z-\[100\] sm:hidden"/g,
  'className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden backdrop-blur-xl bg-[var(--header-bg-blur)] border-t border-[var(--ds-gray-200)]"'
);

// Remove the old background color style
content = content.replace(/background: 'var\(--ds-background-100\)',\n/g, '');

fs.writeFileSync('src/components/BottomNav.jsx', content);
