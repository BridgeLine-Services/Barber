// Theme provider — injects business colors as CSS custom properties
// This runs on the server and generates a <style> tag with the business's theme

import { Business } from '@prisma/client'

interface ThemeProviderProps {
  business: Pick<Business, 'primaryColor' | 'accentColor' | 'secondaryColor' | 'fontFamily' | 'themeMode'>
}

/**
 * Returns a <style> tag with CSS custom properties for the business theme.
 * These override the default Tailwind/shadcn variables.
 */
export function ThemeStyle({ business }: ThemeProviderProps) {
  const css = generateThemeCSS(business)
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

/**
 * Generates CSS custom properties from the business theme.
 * Converts hex colors to HSL for shadcn/ui compatibility.
 */
export function generateThemeCSS(theme: ThemeProviderProps['business']): string {
  const accentHsl = hexToHsl(theme.accentColor || '#d4af37')
  const primaryHsl = hexToHsl(theme.primaryColor || '#1a1a1a')
  const secondaryHsl = theme.secondaryColor
    ? hexToHsl(theme.secondaryColor)
    : hexToHsl('#2a2a2a')

  const fontFamily = theme.fontFamily
    ? mapFontFamily(theme.fontFamily)
    : "'Inter', system-ui, sans-serif"

  const isDark = (theme.themeMode || 'dark') === 'dark'

  return `
:root {
  --accent: ${accentHsl};
  --accent-foreground: ${isDark ? '0 0% 98%' : '0 0% 5%'};
  --primary: ${primaryHsl};
  --primary-foreground: ${isDark ? '0 0% 98%' : '0 0% 5%'};
  --secondary: ${secondaryHsl};
  --secondary-foreground: ${isDark ? '0 0% 98%' : '0 0% 5%'};
  --font-family: ${fontFamily};
}

${isDark ? `
.dark {
  --background: ${primaryHsl};
  --foreground: 0 0% 98%;
  --card: ${secondaryHsl};
  --card-foreground: 0 0% 98%;
  --muted: ${secondaryHsl};
  --muted-foreground: 0 0% 63.9%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: ${accentHsl};
}
` : `
.light {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: ${accentHsl};
}
`}

body {
  font-family: var(--font-family);
}
`
}

/**
 * Converts a hex color to HSL string (e.g., "212 67% 45%")
 */
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Maps a font family name to a CSS font stack
 */
function mapFontFamily(font: string): string {
  const fonts: Record<string, string> = {
    poppins: "'Poppins', 'Inter', system-ui, sans-serif",
    inter: "'Inter', system-ui, sans-serif",
    montserrat: "'Montserrat', 'Inter', system-ui, sans-serif",
    playfair: "'Playfair Display', Georgia, serif",
    roboto: "'Roboto', system-ui, sans-serif",
    oswald: "'Oswald', 'Inter', system-ui, sans-serif",
    lato: "'Lato', 'Inter', system-ui, sans-serif",
  }
  return fonts[font.toLowerCase()] || `'${font}', system-ui, sans-serif`
}
