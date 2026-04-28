const fs = require('fs');

// In Sidebar.jsx
let content = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');
content = content.replace(
  /\{tabs.map\(\(\{ id, label, Icon \}\) => \{/g,
  '{tabs.map(({ id, label, Icon: TabIcon }) => {'
);
content = content.replace(
  /\{\/\* eslint-disable-next-line react\/jsx-pascal-case \*\/\}\n                <Icon \/>/g,
  '<TabIcon />'
);
fs.writeFileSync('src/components/Sidebar.jsx', content);

// In Settings.jsx
let content2 = fs.readFileSync('src/components/Settings.jsx', 'utf8');
content2 = content2.replace(
  /function HubRow\(\{ icon: Icon, label, value, onClick \}\) \{/g,
  'function HubRow({ icon: HubIcon, label, value, onClick }) {'
);
content2 = content2.replace(
  /\{\/\* eslint-disable-next-line react\/jsx-pascal-case \*\/\}\n        <Icon \/>/g,
  '<HubIcon />'
);
fs.writeFileSync('src/components/Settings.jsx', content2);
