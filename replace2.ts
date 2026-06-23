import fs from 'fs';

let content = fs.readFileSync('src/components/MainLayout.tsx', 'utf-8');

content = content.replace(
  /<h2 className="text-4xl md:text-6xl font-display leading-\[0\.85\] tracking-tight uppercase">[\s\S]*?<\/h2>/,
  '<h2 className="text-4xl md:text-6xl font-display leading-[0.85] tracking-tight uppercase whitespace-pre-line">\n                     {productInfo.accessoryHeading}\n                  </h2>'
);

content = content.replace(
  /<p className="text-sm text-text-muted leading-relaxed max-w-md">[\s\S]*?<\/p>/,
  '<p className="text-sm text-text-muted leading-relaxed max-w-md">\n                     {productInfo.accessoryDesc}\n                  </p>'
);

fs.writeFileSync('src/components/MainLayout.tsx', content);
console.log('Done');
