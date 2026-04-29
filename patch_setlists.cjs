const fs = require('fs');

let content = fs.readFileSync('src/components/Setlists.jsx', 'utf8');
content = content.replace(
  /className="modes-card-strong/g,
  'className="border border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)]'
);
content = content.replace(
  /className="modes-card py-14 text-center/g,
  'className="py-14 text-center border border-dashed border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)]'
);
content = content.replace(
  /className="modes-card py-16 px-6/g,
  'className="py-16 px-6 border border-dashed border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)]'
);
content = content.replace(
  /text-\[var\(--modes-text\)\]/g,
  'text-[var(--ds-gray-1000)]'
);
content = content.replace(
  /text-\[var\(--modes-text-muted\)\]/g,
  'text-[var(--ds-gray-900)]'
);
content = content.replace(
  /text-\[var\(--modes-text-dim\)\]/g,
  'text-[var(--ds-gray-700)]'
);
content = content.replace(
  /bg-\[var\(--modes-surface-strong\)\]/g,
  'bg-[var(--ds-gray-200)]'
);
content = content.replace(
  /border-\[var\(--modes-border\)\]/g,
  'border-[var(--ds-gray-200)]'
);
fs.writeFileSync('src/components/Setlists.jsx', content);

let content2 = fs.readFileSync('src/components/SetlistCard.jsx', 'utf8');
content2 = content2.replace(
  /className={cn\(\n        "modes-card-strong flex flex-col/g,
  'className={cn(\n        "border border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)] flex flex-col'
);
content2 = content2.replace(
  /shadow-\[0_8px_28px_rgba\(0,0,0,0\.35\)\]/g,
  'shadow-sm'
);
content2 = content2.replace(
  /text-\[var\(--modes-text\)\]/g,
  'text-[var(--ds-gray-1000)]'
);
content2 = content2.replace(
  /text-\[var\(--modes-text-muted\)\]/g,
  'text-[var(--ds-gray-900)]'
);
content2 = content2.replace(
  /text-\[var\(--modes-text-dim\)\]/g,
  'text-[var(--ds-gray-700)]'
);
fs.writeFileSync('src/components/SetlistCard.jsx', content2);
