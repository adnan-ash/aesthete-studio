import fs from 'fs';

let content = fs.readFileSync('src/components/MainLayout.tsx', 'utf-8');

// Replace state references
content = content.replace(/coffees/g, 'products');
content = content.replace(/setCoffees/g, 'setProducts');
content = content.replace(/currentCoffeeIndex/g, 'currentProductIndex');
content = content.replace(/setCurrentCoffeeIndex/g, 'setCurrentProductIndex');

// Replace mapped object references
content = content.replace(/coffeeInfo\./g, 'productInfo.');
content = content.replace(/coffeeInfo/g, 'productInfo');
content = content.replace(/coffee\.id/g, 'product.id');
content = content.replace(/coffee\.name_en/g, 'product.name_en');
content = content.replace(/coffee\.price/g, 'product.price');
content = content.replace(/coffee\.description_en/g, 'product.description_en');
content = content.replace(/coffee\.image_url/g, 'product.image_url');
content = content.replace(/coffee =>/g, 'product =>');
content = content.replace(/key=\{coffee\.id\}/g, 'key={product.id}');
content = content.replace(/addedIds\[coffee\.id\]/g, 'addedIds[product.id]');

content = content.replace(/ESPRESSO/g, 'PREMIUM');

// Genericizing the UI text
content = content.replace(/Tasting Notes/g, 'Details');
content = content.replace(/100%/g, '{productInfo.metric1Value}');
content = content.replace(/Arabica Beans/g, 'Key Material');
content = content.replace(/\{productInfo\.notes\}/g, '{productInfo.notes}'); // Already fine

content = content.replace(/\{productInfo\.grind\}/g, '{productInfo.metric1Value}');
content = content.replace(/<span className="text-xl text-text-primary\/50">mm<\/span>/g, '');
content = content.replace(/Precision Grind/g, 'Specification');
content = content.replace(/\{productInfo\.grindDesc\}/g, '{productInfo.metric1Desc}');

content = content.replace(/Extraction Yield/g, 'Key Metrics');
content = content.replace(/\{productInfo\.yieldTitle\}/g, '{productInfo.metric2Title}');

content = content.replace(/\{productInfo\.crema\}/g, '{productInfo.metric2Value1}');
content = content.replace(/Crema Viscosity/g, '{productInfo.metric2Value1Sub}');

content = content.replace(/\{productInfo\.extractionTime\}/g, '{productInfo.metric2Value2}');
content = content.replace(/<span className="text-xl text-text-primary\/50">s<\/span>/g, '');
content = content.replace(/Extraction Time/g, '{productInfo.metric2Value2Sub}');

content = content.replace(/\{productInfo\.yieldDesc\}/g, '{productInfo.metric2Desc}');

// Diagram
content = content.replace(/\{productInfo\.temp\}/g, '{productInfo.diagramTemp}');
content = content.replace(/Brew Temp/g, 'Temp / Material');
content = content.replace(/\{productInfo\.profile\}/g, '{productInfo.diagramProfile}');
content = content.replace(/Roast Profile/g, 'Profile / Style');
content = content.replace(/PRESSURE: \{productInfo\.pressure\}/g, 'METRIC 1: {productInfo.diagramPressure}');
content = content.replace(/DOSE: \{productInfo\.dose\}/g, 'METRIC 2: {productInfo.diagramDose}');

// Section 5 Text
content = content.replace(/BARISTA'S CUT/g, 'COLLECTION');
content = content.replace(/Signature Series/g, 'Featured Line');
content = content.replace(/Roasted for the highest level of cup clarity and flavor separation\./g, 'Crafted for the highest level of quality and design separation.');
content = content.replace(/SCA Score 88\+/g, 'Premium Output');
content = content.replace(/Meets rigorous specialty coffee association standards\./g, 'Meets rigorous industry premium standards.');

// Section 6 Text
content = content.replace(/OUR BEANS/g, 'CATALOG');
content = content.replace(/Loading Roasts\.\.\. Try restarting server\./g, 'Loading Products... Try restarting server.');

fs.writeFileSync('src/components/MainLayout.tsx', content);
console.log('Update done');
