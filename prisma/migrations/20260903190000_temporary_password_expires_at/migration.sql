-- User.temporaryPasswordExpiresAt:
--   Expiry for admin/seed-assigned temporary passwords (credentials flagged
--   with mustChangePassword = true). Cleared when the user successfully
--   sets their own password via /change-password. Kept for auditing and for
--   future "temporary password expired" handling.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "temporaryPasswordExpiresAt" TIMESTAMP(3);
