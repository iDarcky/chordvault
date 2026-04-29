const fs = require('fs');

let content = fs.readFileSync('src/components/Library.jsx', 'utf8');
content = content.replace(
  /className="modes-card overflow-hidden divide-y"/g,
  'className="overflow-hidden divide-y border border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)]"'
);
content = content.replace(
  /style=\{\{ borderColor: 'var\(--modes-border\)' \}\}/g,
  ''
);
fs.writeFileSync('src/components/Library.jsx', content);

let content2 = fs.readFileSync('src/components/SongCard.jsx', 'utf8');
content2 = content2.replace(
  /className="cursor-pointer flex flex-col gap-2"/g,
  'className="cursor-pointer flex flex-col gap-2 border border-[var(--ds-gray-200)] rounded-xl p-4 transition-colors hover:bg-[var(--ds-gray-100)]"'
);
fs.writeFileSync('src/components/SongCard.jsx', content2);
