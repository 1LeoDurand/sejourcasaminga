/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Hr, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

/**
 * Shared brand layout for ALL transactional emails (markup only — no send logic).
 * Wraps each template in a consistent Casa Minga Séjours chrome:
 *  - header with the "Casa Minga Séjours" wordmark (logo image = commented placeholder,
 *    Léo will provide the asset and swap the <Img> in),
 *  - the template body (children),
 *  - a footer with the brand mention and, when provided, an unsubscribe link.
 *
 * Brand tokens (terracotta / azur) are exported as `brand` so every template
 * shares the same titles, buttons, spacing and colours.
 */

const SITE_URL = 'https://sejour.casaminga.com'

// ── Brand tokens (single source of truth for transactional emails) ──
export const brand = {
  terracotta: '#C0563B',
  azur: '#2E6E8E',
  ink: '#2e2623',
  body: '#5e524d',
  muted: '#81746e',
  faint: '#a09289',
  cream: '#fbf7f4',
  hairline: '#eee5df',

  main: { backgroundColor: '#fbf7f4', fontFamily: "'Inter', Arial, sans-serif", margin: '0', padding: '0' } as const,
  container: { padding: '0 0 8px', maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '14px', overflow: 'hidden' as const, margin: '24px auto' } as const,
  content: { padding: '8px 28px 4px' } as const,

  header: { padding: '22px 28px 14px', borderBottom: '1px solid #eee5df' } as const,
  wordmark: { fontSize: '18px', fontWeight: 'bold' as const, fontFamily: "'Playfair Display', Georgia, serif", color: '#C0563B', margin: '0', letterSpacing: '0.2px' } as const,

  h1: { fontSize: '24px', fontWeight: 'bold' as const, fontFamily: "'Playfair Display', Georgia, serif", color: '#2e2623', margin: '18px 0 14px' } as const,
  h2: { fontSize: '17px', fontWeight: '600' as const, fontFamily: "'Playfair Display', Georgia, serif", color: '#2e2623', margin: '22px 0 12px' } as const,
  text: { fontSize: '15px', color: '#5e524d', lineHeight: '1.65', margin: '0 0 16px' } as const,
  textSmall: { fontSize: '13px', color: '#81746e', lineHeight: '1.6', margin: '0 0 12px' } as const,
  card: { backgroundColor: '#fbf7f4', borderRadius: '12px', padding: '16px 18px', margin: '6px 0 20px' } as const,
  button: { backgroundColor: '#C0563B', color: '#ffffff', fontSize: '15px', fontWeight: '500' as const, borderRadius: '999px', padding: '13px 26px', textDecoration: 'none', display: 'inline-block' } as const,
  buttonAzur: { backgroundColor: '#2E6E8E', color: '#ffffff', fontSize: '15px', fontWeight: '500' as const, borderRadius: '999px', padding: '13px 26px', textDecoration: 'none', display: 'inline-block' } as const,
  hr: { borderColor: '#eee5df', margin: '26px 0 18px' } as const,
  link: { color: '#C0563B', textDecoration: 'underline' } as const,
  code: { backgroundColor: '#fbf7f4', padding: '3px 9px', borderRadius: '6px', fontFamily: 'monospace', color: '#C0563B', fontSize: '14px' } as const,
}

const footerWrap = { padding: '18px 28px 22px', borderTop: '1px solid #eee5df', marginTop: '8px' } as const
const footerText = { fontSize: '12px', color: '#a09289', textAlign: 'center' as const, margin: '0 0 6px', lineHeight: '1.6' } as const
const footerLink = { color: '#a09289', textDecoration: 'underline' } as const

interface BrandLayoutProps {
  preview: string
  children: React.ReactNode
  unsubscribeUrl?: string
  preferencesUrl?: string
}

export const BrandLayout = ({ preview, children, unsubscribeUrl, preferencesUrl }: BrandLayoutProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={brand.main}>
      <Container style={brand.container}>
        {/* Header — wordmark. LOGO: Léo fournira l'image ; remplacer le wordmark par :
            <Img src="https://sejour.casaminga.com/email-logo.png" alt="Casa Minga Séjours" width="180" height="40" /> */}
        <Section style={brand.header}>
          <Text style={brand.wordmark}>Casa Minga Séjours</Text>
        </Section>

        {/* Body */}
        <Section style={brand.content}>
          {children}
        </Section>

        {/* Footer — brand mention + unsubscribe (réutilisé, jamais retiré) */}
        <Section style={footerWrap}>
          {(preferencesUrl || unsubscribeUrl) && (
            <Text style={footerText}>
              {preferencesUrl && (
                <Link href={preferencesUrl} style={footerLink}>Personnaliser la fréquence</Link>
              )}
              {preferencesUrl && unsubscribeUrl && '  ·  '}
              {unsubscribeUrl && (
                <Link href={unsubscribeUrl} style={footerLink}>Se désabonner</Link>
              )}
            </Text>
          )}
          <Text style={footerText}>
            Casa Minga Séjours — <Link href={SITE_URL} style={brand.link}>sejour.casaminga.com</Link>
          </Text>
          <Text style={footerText}>
            L'échange d'hospitalité entre lieux de vie collectifs.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// Re-export Hr for templates that want the shared hairline inside their body.
export { Hr }
