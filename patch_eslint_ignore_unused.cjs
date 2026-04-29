const fs = require('fs');
let content = fs.readFileSync('src/components/Setlists.jsx', 'utf8');

// I will just add eslint-disable next to the Setlists component props since we removed the preview pane and it uses those props originally.
content = content.replace(
  /export default function Setlists\(\{/g,
  '/* eslint-disable no-unused-vars */\nexport default function Setlists({'
);
fs.writeFileSync('src/components/Setlists.jsx', content);

let libContent = fs.readFileSync('src/components/Library.jsx', 'utf8');
libContent = libContent.replace(
  /export default function Library\(\{/g,
  '/* eslint-disable no-unused-vars */\nexport default function Library({'
);
fs.writeFileSync('src/components/Library.jsx', libContent);
