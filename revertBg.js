const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/className=(['\"])(.*?)\1|className=\{([^]*?)\}/gs, (match, p1, p2, p3) => {
      let classStr = p2 || p3;
      if (!classStr) return match;
      
      if (classStr.includes('dark:bg-') || classStr.includes('dark:hover:bg-') || (classStr.includes('w-4') && classStr.includes('h-4') && classStr.includes('rounded-full') && classStr.includes('absolute'))) {
          classStr = classStr.replace(/bg-\[#6B905F\]/g, 'bg-[#F4F1EB]');
      }
      
      if (p2) return className=;
      return className={\${classStr}\};
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log('Modified ' + changedCount + ' files.');
