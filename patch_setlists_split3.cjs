const fs = require('fs');

let content = fs.readFileSync('src/components/Setlists.jsx', 'utf8');
content = content.replace(
  /const previewSetlist = useMemo\([\s\S]*?\);\n/g,
  ''
);
fs.writeFileSync('src/components/Setlists.jsx', content);
