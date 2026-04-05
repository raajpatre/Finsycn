-- CreateTable
CREATE TABLE "settlement_payments" (
    "id" TEXT NOT NULL,
    "hangout_id" TEXT NOT NULL,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "recorded_by_user_id" TEXT NOT NULL,
    "amount_paise" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlement_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "settlement_payments_hangout_id_idx" ON "settlement_payments"("hangout_id");

-- CreateIndex
CREATE INDEX "settlement_payments_from_user_id_idx" ON "settlement_payments"("from_user_id");

-- CreateIndex
CREATE INDEX "settlement_payments_to_user_id_idx" ON "settlement_payments"("to_user_id");

-- AddForeignKey
ALTER TABLE "settlement_payments" ADD CONSTRAINT "settlement_payments_hangout_id_fkey" FOREIGN KEY ("hangout_id") REFERENCES "hangouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_payments" ADD CONSTRAINT "settlement_payments_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_payments" ADD CONSTRAINT "settlement_payments_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_payments" ADD CONSTRAINT "settlement_payments_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
