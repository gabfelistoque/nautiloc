-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Boat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "pricePerDay" REAL NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "length" REAL NOT NULL DEFAULT 0.0,
    "year" INTEGER NOT NULL DEFAULT 2000,
    "category" TEXT NOT NULL DEFAULT 'Lancha',
    "features" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Boat" ("available", "capacity", "category", "createdAt", "description", "id", "imageUrl", "length", "location", "name", "pricePerDay", "rating", "updatedAt", "year") SELECT "available", "capacity", "category", "createdAt", "description", "id", "imageUrl", "length", "location", "name", "pricePerDay", "rating", "updatedAt", "year" FROM "Boat";
DROP TABLE "Boat";
ALTER TABLE "new_Boat" RENAME TO "Boat";
CREATE UNIQUE INDEX "Boat_name_key" ON "Boat"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
