const fs = require('fs');

// In Sidebar.jsx
let content = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');
content = content.replace(
  /\{tabs.map\(\(\{ id, label, Icon: TabIcon \}\) => \{/g,
  '{tabs.map(({ id, label, Icon }) => {'
);
content = content.replace(
  /<TabIcon \/>/g,
  '<Icon />'
);
fs.writeFileSync('src/components/Sidebar.jsx', content);

// In Settings.jsx
let content2 = fs.readFileSync('src/components/Settings.jsx', 'utf8');
content2 = content2.replace(
  /function HubRow\(\{ icon: HubIcon, label, value, onClick \}\) \{/g,
  'function HubRow({ icon: Icon, label, value, onClick }) {'
);
content2 = content2.replace(
  /<HubIcon \/>/g,
  '<Icon />'
);
fs.writeFileSync('src/components/Settings.jsx', content2);
