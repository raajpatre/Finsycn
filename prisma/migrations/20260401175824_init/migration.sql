-- CreateEnum
CREATE TYPE "HangoutStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hangouts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room_code" CHAR(6) NOT NULL,
    "status" "HangoutStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hangouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hangout_members" (
    "id" TEXT NOT NULL,
    "hangout_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hangout_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "hangout_id" TEXT NOT NULL,
    "payer_id" TEXT NOT NULL,
    "amount_paise" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hangouts_room_code_key" ON "hangouts"("room_code");

-- CreateIndex
CREATE INDEX "hangout_members_user_id_idx" ON "hangout_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hangout_members_hangout_id_user_id_key" ON "hangout_members"("hangout_id", "user_id");

-- CreateIndex
CREATE INDEX "expenses_hangout_id_idx" ON "expenses"("hangout_id");

-- CreateIndex
CREATE INDEX "expenses_payer_id_idx" ON "expenses"("payer_id");

-- AddForeignKey
ALTER TABLE "hangout_members" ADD CONSTRAINT "hangout_members_hangout_id_fkey" FOREIGN KEY ("hangout_id") REFERENCES "hangouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hangout_members" ADD CONSTRAINT "hangout_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_hangout_id_fkey" FOREIGN KEY ("hangout_id") REFERENCES "hangouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
