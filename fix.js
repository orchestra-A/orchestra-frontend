const fs = require('fs');
const path = require('path');
const dir = './src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

let changed = 0;
files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let newContent = content.replace(/(<h1[^>]*className="[^"]*)\s*\bmb-[a-zA-Z0-9\-\.\[\]]+\b([^"]*"[^>]*>.*?<\/h1>)\s*<p\s+className="[^"]*text-gray-500[^>]*>[\s\S]*?<\/p>/g, (match, p1, p2) => {
    if (match.includes('mb-10') || match.includes('mb-8') || match.includes('mb-6')) {
        return p1 + ' mb-8' + p2;
    }
    return p1 + p2;
  });
  if(newContent !== content) {
    fs.writeFileSync(path.join(dir, file), newContent);
    changed++;
    console.log('Modified', file);
  }
});
console.log('Total changed:', changed);
