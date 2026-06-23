import { CoffeeItem } from './types';

export const mockCoffees: CoffeeItem[] = [
  {
    id: "1",
    name_en: "Espresso Reserve",
    name_ar: "إسبريسو ريزيرف",
    description_en: "A bold, full-bodied espresso with notes of dark chocolate and black cherry.",
    description_ar: "إسبريسو جريء وكامل القوام مع نفحات من الشوكولاتة الداكنة والكرز الأسود.",
    price: 4.50,
    roast_level: "Dark",
    model_path: "/models/placeholder-espresso.glb"
  },
  {
    id: "2",
    name_en: "Signature Flat White",
    name_ar: "فلات وايت مميز",
    description_en: "Smooth microfoam over a double ristretto shot, creating perfectly balanced sweetness.",
    description_ar: "رغوة حليب ناعمة فوق جرعة مزدوجة من الريستريتو، لخلق حلاوة متوازنة تماماً.",
    price: 5.00,
    roast_level: "Medium",
    model_path: "/models/placeholder-flatwhite.glb"
  },
  {
    id: "3",
    name_en: "Ethiopian Pour Over",
    name_ar: "قهوة إثيوبية مقطرة",
    description_en: "Bright and floral light roast prepared meticulously with the V60 method.",
    description_ar: "تحميص خفيف ومشرق بنكهة الأزهار محضر بعناية باستخدام طريقة V60.",
    price: 6.50,
    roast_level: "Light",
    model_path: "/models/placeholder-pourover.glb"
  }
];
