const fs = require('fs');

let content = fs.readFileSync('src/components/DesktopLayout.jsx', 'utf8');

// The layout component also sets the grid widths
content = content.replace(
  /xl:grid-cols-\[280px_1fr\]/g,
  'xl:grid-cols-[260px_1fr]'
);

fs.writeFileSync('src/components/DesktopLayout.jsx', content);
