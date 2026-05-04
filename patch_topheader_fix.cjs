const fs = require('fs');

let content = fs.readFileSync('src/components/TopHeader.jsx', 'utf8');

// I accidentally changed the tab click handlers to onSettingsClick('settings') instead of onNavigate!
// Let's fix it back.

content = content.replace(
  `          {tabs.map((tab) => {
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSettingsClick('settings')}
            className={cn(`,
  `          {tabs.map((tab) => {
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={cn(`
);

fs.writeFileSync('src/components/TopHeader.jsx', content, 'utf8');
