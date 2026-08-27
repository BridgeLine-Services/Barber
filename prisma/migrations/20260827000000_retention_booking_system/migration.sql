ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "preferences" JSONB;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "noShowReason" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "noShowAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "noShowMarkedBy" TEXT;
ALTER TABLE "NotificationLog" ADD COLUMN IF NOT EXISTS "failureReason" TEXT;
ALTER TABLE "NotificationLog" ADD COLUMN IF NOT EXISTS "providerMessageId" TEXT;
ALTER TABLE "NotificationLog" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;
ALTER TABLE "NotificationLog" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
ALTER TABLE "NotificationLog" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE TABLE IF NOT EXISTS "RetentionSettings" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "reminder24HoursEnabled" BOOLEAN NOT NULL DEFAULT true,
  "reminder2HoursEnabled" BOOLEAN NOT NULL DEFAULT true,
  "highRiskWarningThreshold" INTEGER NOT NULL DEFAULT 2,
  "requireVerifiedContact" BOOLEAN NOT NULL DEFAULT false,
  "requireManualApproval" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RetentionSettings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RetentionSettings_businessId_key" UNIQUE ("businessId"),
  CONSTRAINT "RetentionSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationLog_idempotencyKey_key" ON "NotificationLog"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "NotificationLog_scheduledAt_status_idx" ON "NotificationLog"("scheduledAt", "status");
