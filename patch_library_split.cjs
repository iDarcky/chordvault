const fs = require('fs');

let content = fs.readFileSync('src/components/Library.jsx', 'utf8');

// 1. Remove previewSongId from state and props logic
content = content.replace(
  /const previewSong = useMemo\([\s\S]*?\);\n/g,
  ''
);

// 2. Modify handleRowClick
content = content.replace(
  /const handleRowClick = \(song\) => \{\n    if \(isDesktop && onSelectPreview\) \{\n      onSelectPreview\(song\.id\);\n    \} else \{\n      onSelectSong\(song\);\n    \}\n  \};/g,
  'const handleRowClick = (song) => {\n    onSelectSong(song);\n  };'
);

// 3. Remove isFullscreen logic from classnames on the main list
content = content.replace(
  /className=\{cn\(\n          "relative min-w-0 pb-8",\n          "lg:h-screen lg:overflow-y-auto lg:border-r lg:border-\[var\(--ds-gray-200\)\]",\n          "flex-1 lg:flex-none lg:w-\[480px\] xl:w-\[560px\]",\n          isFullscreen && "lg:hidden",\n        \)\}/g,
  'className={cn(\n          "relative min-w-0 pb-8 flex-1",\n          "lg:h-[100dvh] lg:overflow-y-auto"\n        )}'
);

// 4. Remove the preview pane completely
const previewPaneRegex = /\{\/\* Preview pane — desktop only \*\/\}\n      <div className="hidden lg:flex lg:flex-1[\s\S]*?<\/div>\n    <\/div>\n  \);\n\}/g;
content = content.replace(previewPaneRegex, '    </div>\n  );\n}');

// 5. Remove the data-theme-variant="modes" block and the containing flex row that makes it a split view
content = content.replace(
  /<div className="flex flex-col lg:flex-row lg:h-screen">\n      <div\n        data-theme-variant="modes"\n/g,
  '<div className="flex flex-col lg:flex-row lg:h-screen w-full max-w-5xl mx-auto">\n      <div\n'
);

// 6. Fix `selected={isDesktop && song.id === previewSongId}`
content = content.replace(
  /selected=\{isDesktop && song\.id === previewSongId\}/g,
  'selected={false}'
);

fs.writeFileSync('src/components/Library.jsx', content);
