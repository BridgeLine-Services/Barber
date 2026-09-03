-- CreateEnum
CREATE TYPE "BookingQuestionType" AS ENUM ('SHORT_TEXT', 'LONG_TEXT', 'YES_NO', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'PHONE', 'EMAIL', 'DATE');

-- AlterEnum
ALTER TYPE "NotificationStatus" ADD VALUE 'PROCESSING';

-- DropIndex
DROP INDEX "NotificationLog_customerId_type_idx";

-- DropIndex
DROP INDEX "NotificationLog_scheduledAt_status_idx";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "customerRescheduleEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "customerRescheduleMinNoticeHours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "customerRescheduleWindowDays" INTEGER,
ADD COLUMN     "fontFamily" TEXT,
ADD COLUMN     "parkingAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentInPerson" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "secondaryColor" TEXT DEFAULT '#2a2a2a',
ADD COLUMN     "teamSectionDescription" TEXT,
ADD COLUMN     "teamSectionLabel" TEXT,
ADD COLUMN     "teamSectionTitle" TEXT,
ADD COLUMN     "themeMode" TEXT NOT NULL DEFAULT 'dark',
ADD COLUMN     "walkInsWelcome" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "NotificationLog" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "businessId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "WebsiteContent" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "heroEyebrow" TEXT,
    "heroTitle" TEXT,
    "heroDescription" TEXT,
    "heroImageUrl" TEXT,
    "heroPrimaryCtaLabel" TEXT,
    "heroPrimaryCtaHref" TEXT,
    "heroSecondaryCtaLabel" TEXT,
    "heroSecondaryCtaHref" TEXT,
    "showServices" BOOLEAN NOT NULL DEFAULT true,
    "showTeam" BOOLEAN NOT NULL DEFAULT true,
    "showReviews" BOOLEAN NOT NULL DEFAULT true,
    "showVisit" BOOLEAN NOT NULL DEFAULT true,
    "showFaq" BOOLEAN NOT NULL DEFAULT true,
    "showFinalCta" BOOLEAN NOT NULL DEFAULT true,
    "servicesTitle" TEXT,
    "servicesDescription" TEXT,
    "teamTitle" TEXT,
    "teamDescription" TEXT,
    "reviewsTitle" TEXT,
    "reviewsDescription" TEXT,
    "visitTitle" TEXT,
    "visitDescription" TEXT,
    "faqTitle" TEXT,
    "faqDescription" TEXT,
    "finalCtaTitle" TEXT,
    "finalCtaDescription" TEXT,
    "featuredReviewCount" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingQuestion" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "BookingQuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "helpText" TEXT,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentIntakeResponse" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "questionId" TEXT,
    "questionKey" TEXT NOT NULL,
    "questionLabel" TEXT NOT NULL,
    "questionType" "BookingQuestionType" NOT NULL,
    "questionOptions" JSONB,
    "answer" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentIntakeResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RescheduleHistory" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "previousStartTime" TIMESTAMP(3) NOT NULL,
    "previousEndTime" TIMESTAMP(3) NOT NULL,
    "newStartTime" TIMESTAMP(3) NOT NULL,
    "newEndTime" TIMESTAMP(3) NOT NULL,
    "actor" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RescheduleHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalVerificationChallenge" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "contactHash" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalVerificationChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalSession" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteContent_businessId_key" ON "WebsiteContent"("businessId");

-- CreateIndex
CREATE INDEX "BookingQuestion_businessId_isActive_sortOrder_idx" ON "BookingQuestion"("businessId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BookingQuestion_businessId_key_key" ON "BookingQuestion"("businessId", "key");

-- CreateIndex
CREATE INDEX "AppointmentIntakeResponse_appointmentId_idx" ON "AppointmentIntakeResponse"("appointmentId");

-- CreateIndex
CREATE INDEX "RescheduleHistory_businessId_createdAt_idx" ON "RescheduleHistory"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "RescheduleHistory_appointmentId_idx" ON "RescheduleHistory"("appointmentId");

-- CreateIndex
CREATE INDEX "PortalVerificationChallenge_businessId_contactHash_createdA_idx" ON "PortalVerificationChallenge"("businessId", "contactHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortalSession_tokenHash_key" ON "PortalSession"("tokenHash");

-- CreateIndex
CREATE INDEX "PortalSession_businessId_customerId_expiresAt_idx" ON "PortalSession"("businessId", "customerId", "expiresAt");

-- CreateIndex
CREATE INDEX "Faq_businessId_isActive_sortOrder_idx" ON "Faq"("businessId", "isActive", "sortOrder");

-- AddForeignKey
ALTER TABLE "WebsiteContent" ADD CONSTRAINT "WebsiteContent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingQuestion" ADD CONSTRAINT "BookingQuestion_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentIntakeResponse" ADD CONSTRAINT "AppointmentIntakeResponse_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentIntakeResponse" ADD CONSTRAINT "AppointmentIntakeResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BookingQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RescheduleHistory" ADD CONSTRAINT "RescheduleHistory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RescheduleHistory" ADD CONSTRAINT "RescheduleHistory_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalVerificationChallenge" ADD CONSTRAINT "PortalVerificationChallenge_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSession" ADD CONSTRAINT "PortalSession_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalSession" ADD CONSTRAINT "PortalSession_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

