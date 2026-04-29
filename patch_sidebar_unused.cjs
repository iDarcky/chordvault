const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.jsx', 'utf8');

// remove unused 'Icon' in Nav row where it maps over tabs.
// wait, we do use Icon: <Icon />
// wait, line 157 in Sidebar.jsx:
// const navButtonClass = (active) =>
//   `group flex items-center justify-center xl:justify-start xl:gap-3 h-11 w-11 xl:w-full xl:px-3 mx-auto xl:mx-0 rounded-lg cursor-pointer transition-colors duration-200 border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-teal-600)] ${
//     active
//       ? 'bg-[var(--ds-gray-200)] text-[var(--ds-gray-1000)] font-semibold'
//       : 'bg-transparent text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)]'
//   }`;
