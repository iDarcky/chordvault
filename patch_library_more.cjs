const fs = require('fs');

let content = fs.readFileSync('src/components/Library.jsx', 'utf8');

// Replace remaining `modes-card` which gave the old floating block feel
content = content.replace(
  /className="modes-card py-14 text-center flex flex-col items-center gap-3 border-dashed"/g,
  'className="py-14 text-center flex flex-col items-center gap-3 border border-dashed border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)]"'
);

content = content.replace(
  /className="modes-card py-16 px-6 flex flex-col items-center text-center border-dashed"/g,
  'className="py-16 px-6 flex flex-col items-center text-center border border-dashed border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)]"'
);

content = content.replace(
  /text-\[var\(--modes-text\)\]/g,
  'text-[var(--ds-gray-1000)]'
);

content = content.replace(
  /text-\[var\(--modes-text-dim\)\]/g,
  'text-[var(--ds-gray-700)]'
);

content = content.replace(
  /text-\[var\(--modes-text-muted\)\]/g,
  'text-[var(--ds-gray-900)]'
);

content = content.replace(
  /bg-\[var\(--modes-surface-strong\)\]/g,
  'bg-[var(--ds-gray-200)]'
);

content = content.replace(
  /border-\[var\(--modes-border\)\]/g,
  'border-[var(--ds-gray-200)]'
);

content = content.replace(
  /hover:bg-\[var\(--modes-surface\)\]/g,
  'hover:bg-[var(--ds-gray-200)]'
);

fs.writeFileSync('src/components/Library.jsx', content);
