// ============================================================================
// Security Utilities
// Two-factor authentication helpers, password hashing, session security
// ============================================================================

import { createHash, randomBytes, timingSafeEqual } from 'crypto'

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

/**
 * Generate a TOTP secret for 2FA
 */
export function generateTOTPSecret(): string {
  return randomBytes(20).toString('hex')
}

/**
 * Verify a TOTP code against the secret
 * Uses HMAC-SHA1 with 30-second time step
 */
export function verifyTOTP(token: string, secret: string, window: number = 1): boolean {
  const timeStep = 30
  const currentTime = Math.floor(Date.now() / 1000)
  
  for (let offset = -window; offset <= window; offset++) {
    const counter = Math.floor(currentTime / timeStep) + offset
    const counterBuffer = Buffer.alloc(8)
    counterBuffer.writeBigInt64BE(BigInt(counter))
    
    const hmac = createHash('sha1').update(Buffer.concat([Buffer.from(secret, 'hex'), counterBuffer])).digest()
    const offsetByte = hmac[hmac.length - 1] & 0xf
    const generatedToken = ((hmac[offsetByte] & 0x7f) << 24 |
      ((hmac[offsetByte + 1] & 0xff) << 16) |
      ((hmac[offsetByte + 2] & 0xff) << 8) |
      (hmac[offsetByte + 3] & 0xff)).toString().slice(-6)
    
    if (timingSafeEqual(Buffer.from(token.padStart(6, '0')), Buffer.from(generatedToken.padStart(6, '0')))) {
      return true
    }
  }
  
  return false
}

/**
 * Generate backup codes for 2FA
 * Returns 10 single-use codes
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    codes.push(randomBytes(4).toString('hex').toUpperCase())
  }
  return codes
}

/**
 * Hash a backup code for storage
 */
export function hashBackupCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

/**
 * Verify a backup code against stored hashes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const hash = hashBackupCode(code)
  return hashedCodes.includes(hash)
}

/**
 * Extract client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP
  return 'unknown'
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Content Security Policy nonce for inline scripts
 */
export function generateCSPNonce(): string {
  return randomBytes(16).toString('base64')
}

/**
 * Password strength checker
 * Returns a score 0-4 and label
 */
export function checkPasswordStrength(password: string): { score: number; label: string; suggestions: string[] } {
  let score = 0
  const suggestions: string[] = []
  
  if (password.length >= 8) score++
  else suggestions.push('Use at least 10 characters')
  
  if (password.length >= 12) score++
  
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  else suggestions.push('Mix uppercase and lowercase letters')
  
  if (/\d/.test(password)) score++
  else suggestions.push('Include numbers')
  
  if (/[^a-zA-Z0-9]/.test(password)) score++
  else suggestions.push('Include special characters')
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const clampedScore = Math.min(score, 4)
  
  return { score: clampedScore, label: labels[clampedScore], suggestions }
}

/**
 * Generate a session fingerprint for additional security
 */
export function generateSessionFingerprint(ip: string, userAgent: string): string {
  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex')
}
