const fs = require('fs');

let content = fs.readFileSync('src/components/Setlists.jsx', 'utf8');

// 1. Modify handleSetlistClick to always select
content = content.replace(
  /const handleSetlistClick = \(sl\) => \{\n    if \(isDesktop\) \{\n      onSelectPreview\(sl\.id\);\n    \} else \{\n      onViewSetlist\(sl\);\n    \}\n  \};/g,
  'const handleSetlistClick = (sl) => {\n    onViewSetlist(sl);\n  };'
);

// 2. Remove isFullscreen logic from classnames on the main list
content = content.replace(
  /className=\{cn\(\n          "relative min-w-0 pb-8",\n          "lg:h-screen lg:overflow-y-auto lg:border-r lg:border-\[var\(--modes-border\)\]",\n          "flex-1 lg:flex-none lg:w-\[480px\] xl:w-\[560px\]",\n          isFullscreen && "lg:hidden",\n        \)\}/g,
  'className={cn(\n          "relative min-w-0 pb-8 flex-1",\n          "lg:h-[100dvh] lg:overflow-y-auto"\n        )}'
);

// 3. Remove the preview pane completely
const previewPaneRegex = /\{\/\* Preview pane — desktop only \*\/\}\n      <div className="hidden lg:flex lg:flex-1[\s\S]*?<\/div>\n    <\/div>\n  \);\n\}/g;
content = content.replace(previewPaneRegex, '    </div>\n  );\n}');

// 4. Wrap with max-w-5xl
content = content.replace(
  /<div className="flex flex-col lg:flex-row lg:h-screen">\n      <div\n        data-theme-variant="modes"\n/g,
  '<div className="flex flex-col lg:flex-row lg:h-[100dvh] w-full max-w-5xl mx-auto">\n      <div\n'
);

// 5. Fix selected state on Card
content = content.replace(
  /selected=\{isDesktop && sl\.id === previewSetlistId\}/g,
  'selected={false}'
);

fs.writeFileSync('src/components/Setlists.jsx', content);
