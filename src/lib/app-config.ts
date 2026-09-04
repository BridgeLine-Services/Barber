// ============================================================================
// APP MODE — central switch between demo and production behavior.
//
//   APP_MODE=demo        → demo/development mode: demo seed data allowed,
//                          demo credentials (e.g. password123) permitted,
//                          sample content seeding enabled.
//   APP_MODE=production  → (default) production mode: no demo accounts, no
//                          demo data fallbacks, fails fast if required
//                          configuration is missing.
//
// Local development is NOT broken: `npm run dev` works in production mode
// against a local database. Set APP_MODE=demo only when you explicitly want
// the demo dataset (sample customers, appointments, reviews, known password).
// ============================================================================

export type AppMode = 'demo' | 'production'

function readMode(): AppMode {
  const raw = (process.env.APP_MODE || 'production').trim().toLowerCase()
  if (raw === 'demo') return 'demo'
  if (raw === 'production' || raw === 'prod') return 'production'
  // Unknown APP_MODE values fail safe: behave as production.
  console.warn(`[app-config] Unknown APP_MODE "${raw}" — falling back to "production".`)
  return 'production'
}

const MODE: AppMode = readMode()

export const appConfig = {
  mode: MODE,
  isDemo: MODE === 'demo',
  isProduction: MODE === 'production',
} as const

/** True only in explicit demo mode (APP_MODE=demo). */
export function isDemoMode(): boolean {
  return MODE === 'demo'
}

/** True in explicit demo mode OR local development (NODE_ENV=development). */
export function isDevelopmentMode(): boolean {
  return MODE === 'demo' || process.env.NODE_ENV === 'development'
}

/** True in production mode (APP_MODE unset or "production"). */
export function isProductionMode(): boolean {
  return MODE === 'production'
}

/**
 * Throw if required production environment configuration is missing.
 * Call this at startup points where missing configuration must fail fast
 * instead of silently degrading (e.g. before serving dashboard traffic).
 */
export function assertProductionConfiguration(): void {
  if (!isProductionMode()) return

  const missing: string[] = []
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!process.env.NEXTAUTH_SECRET) missing.push('NEXTAUTH_SECRET')
  if (!process.env.NEXTAUTH_URL) missing.push('NEXTAUTH_URL')

  if (missing.length > 0) {
    throw new Error(
      `Production configuration is incomplete — missing: ${missing.join(', ')}. ` +
        'Set these environment variables or use APP_MODE=demo for local testing.'
    )
  }
}

/**
 * Well-known weak/demo passwords that must NEVER be accepted in production
 * mode (seed script enforces this; auth login still validates normally).
 */
export const KNOWN_WEAK_PASSWORDS = [
  'password123',
  'password',
  '123456',
  '12345678',
  'admin123',
  'letmein',
  'qwerty123',
]

/** Rejects well-known weak/demo passwords. Always safe to call; only enforced in production mode. */
export function isKnownWeakPassword(password: string): boolean {
  const normalized = password.trim().toLowerCase()
  return KNOWN_WEAK_PASSWORDS.includes(normalized)
}

// ============================================================================
// OWNER REGISTRATION MODE — controls whether new owner accounts can be
// created on this deployment.
//
//   OWNER_REGISTRATION_MODE=onboarding    → (default) public owner sign-up
//                                           enabled; new owners are sent
//                                           straight into onboarding.
//   OWNER_REGISTRATION_MODE=invite_only   → no public sign-up. Accounts are
//                                           created by an administrator
//                                           (invitation); the register UI
//                                           explains this.
//   OWNER_REGISTRATION_MODE=disabled      → registration hidden. Only
//                                           existing users can log in.
//
// Unknown values fail safe: registration is DISABLED (never accidentally
// leave sign-up open on a customer deployment because of a typo).
// ============================================================================

export type OwnerRegistrationMode = 'onboarding' | 'invite_only' | 'disabled'

function readOwnerRegistrationMode(): OwnerRegistrationMode {
  const raw = (process.env.OWNER_REGISTRATION_MODE || 'onboarding').trim().toLowerCase()
  if (raw === 'onboarding') return 'onboarding'
  if (raw === 'invite_only' || raw === 'inviteonly') return 'invite_only'
  if (raw === 'disabled') return 'disabled'
  console.warn(
    `[app-config] Unknown OWNER_REGISTRATION_MODE "${raw}" — failing safe to "disabled".`
  )
  return 'disabled'
}

const REGISTRATION_MODE: OwnerRegistrationMode = readOwnerRegistrationMode()

export const registrationConfig = {
  mode: REGISTRATION_MODE,
  /** Public self-service sign-up allowed (creates an owner in onboarding). */
  isOpen: REGISTRATION_MODE === 'onboarding',
  isInviteOnly: REGISTRATION_MODE === 'invite_only',
  isDisabled: REGISTRATION_MODE === 'disabled',
} as const

export function getOwnerRegistrationMode(): OwnerRegistrationMode {
  return REGISTRATION_MODE
}

// ============================================================================
// SMTP SENDER — the From address for every outbound system email.
//
// Local development may fall back to a placeholder sender; PRODUCTION must
// set SMTP_FROM or sending is refused (a fake "noreply@barbershop.com"
// domain would fail SPF/DKIM and can never represent a customer's shop).
// Callers wrap sends in try/catch, so throwing degrades to a logged skip.
// ============================================================================

export function getSmtpFromAddress(): string {
  if (process.env.SMTP_FROM) return process.env.SMTP_FROM
  if (appConfig.isProduction) {
    throw new Error('SMTP_FROM is not configured — refusing to send email from a placeholder sender.')
  }
  return 'noreply@barbershop.com' // local development only
}
