-- User.passwordChangedAt:
--   Timestamp of the last password set/change (registration, self-service
--   change via /change-password, or token-based reset via /reset-password).
--   Used for security auditing and session-staleness checks.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);
