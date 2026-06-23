-- CreateTable
CREATE TABLE "Coffee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "roast_level" INTEGER NOT NULL,
    "image_url" TEXT
);
