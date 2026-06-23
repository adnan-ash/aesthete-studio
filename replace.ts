import fs from 'fs';

let content = fs.readFileSync('src/components/MainLayout.tsx', 'utf-8');

content = content.replace(
  '<div className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase">Hardware</div>',
  '<div className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase">{productInfo.accessoryTitle}</div>'
);

content = content.replace(
  '<h2 className="text-4xl md:text-6xl font-display leading-[0.85] tracking-tight uppercase">\\n                     Precision<br/>Engineered\\n                  </h2>',
  '<h2 className="text-4xl md:text-6xl font-display leading-[0.85] tracking-tight uppercase whitespace-pre-line">\\n                     {productInfo.accessoryHeading}\\n                  </h2>'
);

content = content.replace(
  '<p className="text-sm text-text-muted leading-relaxed max-w-md">\\n                     Interact with our 3D equipment concept. Every micron of adjustment matters when extracting the perfect shot. Our conceptual grinder brings commercial-grade precision to the digital experience.\\n                  </p>',
  '<p className="text-sm text-text-muted leading-relaxed max-w-md">\\n                     {productInfo.accessoryDesc}\\n                  </p>'
);

fs.writeFileSync('src/components/MainLayout.tsx', content);
console.log('Done');
