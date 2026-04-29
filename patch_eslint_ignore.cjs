const fs = require('fs');

// In Sidebar.jsx
let content = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');
content = content.replace(
  /<Icon \/>/g,
  '{/* eslint-disable-next-line react/jsx-pascal-case */}\n                <Icon />'
);
fs.writeFileSync('src/components/Sidebar.jsx', content);

// In Settings.jsx
let content2 = fs.readFileSync('src/components/Settings.jsx', 'utf8');
content2 = content2.replace(
  /<Icon \/>/g,
  '{/* eslint-disable-next-line react/jsx-pascal-case */}\n        <Icon />'
);
fs.writeFileSync('src/components/Settings.jsx', content2);
