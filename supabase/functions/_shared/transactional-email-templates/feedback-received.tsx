/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandLayout, brand } from './BrandLayout.tsx'

const SITE_NAME = 'Casa Minga Séjours'

interface Props {
  type?: string
  message?: string
  fromEmail?: string
  pageUrl?: string
  userAgent?: string
  submittedAt?: string
}

const labelForType = (t?: string) => {
  if (t === 'bug') return '🐛 Bug signalé'
  if (t === 'question') return '❓ Question'
  if (t === 'suggestion') return '💡 Suggestion'
  return '📨 Feedback'
}

const FeedbackReceivedEmail = ({ type, message, fromEmail, pageUrl, userAgent, submittedAt }: Props) => (
  <BrandLayout preview={`${labelForType(type)} — ${SITE_NAME}`}>
    <Heading style={brand.h1}>{labelForType(type)}</Heading>
    <Text style={brand.text}>
      Un nouveau retour vient d'être envoyé depuis {SITE_NAME}.
    </Text>

    <Section style={brand.card}>
      <Text style={cardLabel}>Message</Text>
      <Text style={cardQuote}>« {message || '—'} »</Text>

      {fromEmail && (
        <>
          <Text style={cardLabel}>Email de contact</Text>
          <Text style={cardValue}>{fromEmail}</Text>
        </>
      )}
      {pageUrl && (
        <>
          <Text style={cardLabel}>Page d'origine</Text>
          <Text style={cardValue}>{pageUrl}</Text>
        </>
      )}
      {submittedAt && (
        <>
          <Text style={cardLabel}>Envoyé le</Text>
          <Text style={cardValue}>{submittedAt}</Text>
        </>
      )}
      {userAgent && (
        <>
          <Text style={cardLabel}>Navigateur</Text>
          <Text style={cardValueSmall}>{userAgent}</Text>
        </>
      )}
    </Section>

    <Text style={brand.textSmall}>{SITE_NAME} — modération</Text>
  </BrandLayout>
)

export const template = {
  component: FeedbackReceivedEmail,
  subject: (d: any) => `${labelForType(d?.type)} — ${SITE_NAME}`,
  displayName: 'Feedback reçu (admin)',
  previewData: {
    type: 'bug',
    message: "Le bouton 'Rejoindre' ne fonctionne pas sur mobile.",
    fromEmail: 'utilisateur@example.com',
    pageUrl: 'https://sejour.casaminga.com/discover',
    userAgent: 'Mozilla/5.0 ...',
    submittedAt: '30 avril 2026, 14:32',
  },
} satisfies TemplateEntry

const cardLabel = { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px', color: brand.faint, margin: '12px 0 2px', fontWeight: '600' as const }
const cardValue = { fontSize: '14px', color: brand.ink, margin: '0 0 4px', lineHeight: '1.5' }
const cardValueSmall = { fontSize: '12px', color: brand.body, margin: '0 0 4px', lineHeight: '1.4', wordBreak: 'break-all' as const }
const cardQuote = { fontSize: '14px', color: brand.ink, fontStyle: 'italic' as const, margin: '0 0 8px', lineHeight: '1.6' }
