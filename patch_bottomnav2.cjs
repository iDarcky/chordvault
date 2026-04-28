const fs = require('fs');

let content = fs.readFileSync('src/components/BottomNav.jsx', 'utf8');

// The gradient fade also looks out of place if the bottom nav is frosted,
// so let's update it or just remove the background to let the glass effect shine
content = content.replace(
  /background: 'linear-gradient\(to top, var\(--ds-background-100\) 0%, transparent 100%\)',/g,
  '/* gradient removed for cleaner glass effect */'
);

fs.writeFileSync('src/components/BottomNav.jsx', content);
