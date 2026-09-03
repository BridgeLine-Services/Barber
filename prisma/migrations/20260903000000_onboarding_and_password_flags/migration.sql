-- Persistent onboarding status + forced password-change flag.
--
-- User.mustChangePassword:
--   Set true by the seed script when credentials are generated or demo
--   passwords are used. Authenticated dashboard access is blocked until the
--   user changes their password via /change-password.
--
-- Business.onboarding*:
--   Persistent white-label setup status. Dashboard access for owners is
--   blocked until onboardingCompleted = true.

-- ─── User.mustChangePassword ───────────────────────────────────────────────
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- ─── Business onboarding fields ───────────────────────────────────────────
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "onboardingStep" TEXT NOT NULL DEFAULT 'business';
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3);
