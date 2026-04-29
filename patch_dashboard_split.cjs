const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// Dashboard is already max-w-5xl, but I will make sure it is clean.
content = content.replace(
  /data-theme-variant="modes"/g,
  ''
);

fs.writeFileSync('src/components/Dashboard.jsx', content);
