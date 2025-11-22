-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'User',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dashboard" BOOLEAN NOT NULL DEFAULT false,
    "inventory" BOOLEAN NOT NULL DEFAULT false,
    "operations" BOOLEAN NOT NULL DEFAULT false,
    "audit_log" BOOLEAN NOT NULL DEFAULT false,
    "settings" BOOLEAN NOT NULL DEFAULT false,
    "user_mgmt" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_userId_key" ON "Permissions"("userId");

-- AddForeignKey
ALTER TABLE "Permissions" ADD CONSTRAINT "Permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
