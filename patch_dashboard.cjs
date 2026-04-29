const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// The Dashboard currently uses `modes-card` directly
content = content.replace(
  /className="modes-card/g,
  'className="border border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)]'
);
content = content.replace(
  /className="modes-card-strong/g,
  'className="border border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)]'
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

fs.writeFileSync('src/components/Dashboard.jsx', content);
