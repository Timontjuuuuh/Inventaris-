-- CreateTable
CREATE TABLE "Onderdeel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "barcode" TEXT,
    "naam" TEXT NOT NULL,
    "omschrijving" TEXT,
    "categorie" TEXT,
    "aantal" INTEGER NOT NULL DEFAULT 0,
    "minimumAantal" INTEGER NOT NULL DEFAULT 0,
    "locatie" TEXT,
    "inkoopprijs" REAL,
    "verkoopprijs" REAL,
    "leverancier" TEXT,
    "notities" TEXT,
    "aangemaakt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bijgewerkt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Onderdeel_barcode_key" ON "Onderdeel"("barcode");
