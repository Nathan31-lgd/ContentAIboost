-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "shopifyDomain" TEXT NOT NULL,
    "shopifyAccessToken" TEXT NOT NULL,
    "email" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Optimization" (
    "id" SERIAL NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "seoScoreBefore" INTEGER,
    "seoScoreAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "Optimization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopifyDomain_key" ON "Shop"("shopifyDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_email_key" ON "Shop"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_shopId_provider_key" ON "ApiKey"("shopId", "provider");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Optimization" ADD CONSTRAINT "Optimization_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
