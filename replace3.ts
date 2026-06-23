import fs from 'fs';

let content = fs.readFileSync('src/components/MainLayout.tsx', 'utf-8');

content = content.replace(
  '<EquipmentCanvas isDark={isDark} accentColor={productInfo.accent} />',
  '<EquipmentCanvas isDark={isDark} category={productInfo.category} accentColor={productInfo.accent} />'
);

fs.writeFileSync('src/components/MainLayout.tsx', content);
console.log('Done');
