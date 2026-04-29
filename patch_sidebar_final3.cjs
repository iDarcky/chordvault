const fs = require('fs');

// The issue was I renamed `Icon` in the destructuring to `TabIcon` but never changed it in the function call because it was mapping the parameter names.
// Let's just restore them exactly how they were, because `Icon` is perfectly fine in React if capitalized.
// The lint errors are for something else but the `Icon` unused var was my fault.

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
