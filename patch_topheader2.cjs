const fs = require('fs');

let content = fs.readFileSync('src/components/TopHeader.jsx', 'utf8');

content = content.replace(
  /onClick=\{[^\}]+\}\s*className=\{cn\(/,
  `onClick={() => onSettingsClick('settings')}
            className={cn(`
);

fs.writeFileSync('src/components/TopHeader.jsx', content, 'utf8');
