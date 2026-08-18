// ============================================================================
// Environment Validation Utility
// Validates that required environment variables are set before the app runs.
// Used by health check and deployment verification.
// ============================================================================

export interface EnvCheckResult {
  variable: string
  set: boolean
  required: boolean
  description: string
}

export const REQUIRED_ENV_VARS = [
  { variable: 'DATABASE_URL', description: 'PostgreSQL connection string' },
  { variable: 'NEXTAUTH_SECRET', description: 'NextAuth session encryption secret' },
  { variable: 'NEXTAUTH_URL', description: 'Public URL of the deployment' },
]

export const OPTIONAL_ENV_VARS = [
  { variable: 'SMTP_HOST', description: 'Email server host (for booking confirmations)' },
  { variable: 'SMTP_PORT', description: 'Email server port' },
  { variable: 'SMTP_USER', description: 'Email server username' },
  { variable: 'SMTP_PASS', description: 'Email server password' },
  { variable: 'SMTP_FROM', description: 'From email address for notifications' },
  { variable: 'TWILIO_ACCOUNT_SID', description: 'Twilio account SID (for SMS reminders)' },
  { variable: 'TWILIO_AUTH_TOKEN', description: 'Twilio auth token' },
  { variable: 'TWILIO_PHONE_NUMBER', description: 'Twilio sender phone number' },
  { variable: 'GOOGLE_CLIENT_ID', description: 'Google OAuth client ID' },
  { variable: 'GOOGLE_CLIENT_SECRET', description: 'Google OAuth client secret' },
  { variable: 'GBP_ACCESS_TOKEN', description: 'Google Business Profile access token (from OAuth)' },
  { variable: 'GBP_REFRESH_TOKEN', description: 'Google Business Profile refresh token (long-lived)' },
  { variable: 'GBP_ACCOUNT_ID', description: 'Google Business Profile account ID' },
  { variable: 'GBP_LOCATION_ID', description: 'Google Business Profile location ID' },
  { variable: 'CRON_SECRET', description: 'Secret for protecting cron job endpoints' },
]

export function checkEnvironment(): {
  allRequiredSet: boolean
  results: EnvCheckResult[]
  missing: string[]
} {
  const results: EnvCheckResult[] = []
  const missing: string[] = []

  for (const { variable, description } of REQUIRED_ENV_VARS) {
    const isSet = !!process.env[variable]
    results.push({ variable, set: isSet, required: true, description })
    if (!isSet) missing.push(variable)
  }

  for (const { variable, description } of OPTIONAL_ENV_VARS) {
    results.push({ variable, set: !!process.env[variable], required: false, description })
  }

  return {
    allRequiredSet: missing.length === 0,
    results,
    missing,
  }
}
