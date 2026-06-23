import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany({});
  await prisma.product.createMany({
    data: [
      {
        category: "coffee",
        name_en: "Ethiopian Yirgacheffe",
        name_ar: "إثيوبي يرجاشيفي",
        description_en: "Floral aroma with a vibrant crisp acidity.",
        description_ar: "رائحة زهرية مع حموضة هشة نابضة بالحياة.",
        price: 24.99,
        image_url: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        accent_color: "#ceb693",
        theme: "dark"
      },
      {
        category: "book",
        name_en: "Design Systems",
        name_ar: "أنظمة التصميم",
        description_en: "A comprehensive guide to creating scalable digital products.",
        description_ar: "دليل شامل لإنشاء منتجات رقمية قابلة للتطوير.",
        price: 45.00,
        image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        accent_color: "#3b82f6",
        theme: "light"
      },
      {
        category: "glasses",
        name_en: "Tortoise Shell Frames",
        name_ar: "إطارات صدفة السلحفاة",
        description_en: "Vintage aesthetic with modern premium acetate.",
        description_ar: "جمال عتيق مع أسيتات ممتاز حديث.",
        price: 120.00,
        image_url: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        accent_color: "#f59e0b",
        theme: "dark"
      },
      {
        category: "watch",
        name_en: "Minimalist Chrono",
        name_ar: "كرونوغراف بسيط",
        description_en: "Sleek automatic timepiece with a brushed steel dial.",
        description_ar: "ساعة أوتوماتيكية أنيقة بمينا فولاذي ناعم.",
        price: 350.00,
        image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        accent_color: "#10b981",
        theme: "light"
      }
    ]
  });
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
