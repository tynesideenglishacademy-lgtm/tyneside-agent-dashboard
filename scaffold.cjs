const fs = require('fs');
const path = require('path');

const dirs = [
  'src/components/ui',
  'src/components/layout',
  'src/services',
  'src/hooks',
  'backend/src/routes',
  'backend/src/controllers',
  'backend/src/services',
  'backend/src/config'
];

dirs.forEach(dir => {
  const p = path.join(process.cwd(), dir);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
    console.log('Created directory:', p);
  }
});

// Move components
const componentsToMove = ['Layout.tsx', 'Sidebar.tsx', 'Sidebar.css'];
componentsToMove.forEach(file => {
  const oldPath = path.join(process.cwd(), 'src/components', file);
  const newPath = path.join(process.cwd(), 'src/components/layout', file);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${file} to layout/`);
  }
});

console.log('Folders scaffolded and files moved.');
