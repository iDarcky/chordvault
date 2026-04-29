const fs = require('fs');
let content = fs.readFileSync('src/components/Setlists.jsx', 'utf8');

content = content.replace(
  /className=\{cn\(\n          "relative min-w-0 pb-8",\n          "lg:h-screen lg:overflow-y-auto lg:border-r lg:border-\[var\(--ds-gray-200\)\]",\n          "flex-1 lg:flex-none lg:w-\[480px\] xl:w-\[560px\]",\n          isFullscreen && "lg:hidden",\n        \)\}/g,
  'className={cn(\n          "relative min-w-0 pb-8 flex-1",\n          "lg:h-[100dvh] lg:overflow-y-auto"\n        )}'
);

fs.writeFileSync('src/components/Setlists.jsx', content);
