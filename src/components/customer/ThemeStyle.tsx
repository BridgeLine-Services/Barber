// Theme provider — injects business colors as CSS custom properties
// This runs on the server and generates a <style> tag with the business's theme
//
// Theme logic (generateThemeCSS, hexToHsl, mapFontFamily, font options) lives
// in src/lib/theme.ts — shared with the onboarding branding preview so both
// render from the exact same code path.

import { Business } from '@prisma/client'
import { generateThemeCSS, type ThemeSettings } from '@/lib/theme'

interface ThemeProviderProps {
  business: Pick<Business, 'primaryColor' | 'accentColor' | 'secondaryColor' | 'fontFamily' | 'themeMode'>
}

/**
 * Returns a <style> tag with CSS custom properties for the business theme.
 * These override the default Tailwind/shadcn variables.
 */
export function ThemeStyle({ business }: ThemeProviderProps) {
  const css = generateThemeCSS(business as ThemeSettings)
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
