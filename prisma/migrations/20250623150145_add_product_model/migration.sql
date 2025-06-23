-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "handle" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "imageUrl" TEXT,
    "price" TEXT NOT NULL DEFAULT '0',
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "shopifyUpdatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_shopDomain_idx" ON "Product"("shopDomain");

-- CreateIndex
CREATE INDEX "Product_seoScore_idx" ON "Product"("seoScore");

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopifyId_shopDomain_key" ON "Product"("shopifyId", "shopDomain");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopDomain_fkey" FOREIGN KEY ("shopDomain") REFERENCES "Shop"("shopifyDomain") ON DELETE CASCADE ON UPDATE CASCADE;
