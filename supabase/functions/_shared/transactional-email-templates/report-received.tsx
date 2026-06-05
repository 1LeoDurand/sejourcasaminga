/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Casa Minga'
const SITE_URL = 'https://sejour.casaminga.com'

interface Props {
  targetType?: string
  targetId?: string
  reason?: string
  details?: string
  reporterName?: string
  submittedAt?: string
}

const labelForReason = (r?: string) => {
  switch (r) {
    case 'fake_listing': return 'Annonce fausse ou trompeuse'
    case 'misleading_info': return 'Informations incorrectes'
    case 'inappropriate_content': return 'Contenu inapproprié'
    case 'harassment': return 'Harcèlement ou comportement abusif'
    case 'spam': return 'Spam ou publicité'
    default: return 'Autre raison'
  }
}

const labelForTarget = (t?: string) => {
  switch (t) {
    case 'listing': return 'un séjour'
    case 'place': return 'un lieu'
    case 'profile': return 'un profil'
    case 'review': return 'un avis'
    default: return 'un élément'
  }
}

const ReportReceivedEmail = ({ targetType, targetId, reason, details, reporterName, submittedAt }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>🚩 Nouveau signalement — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🚩 Nouveau signalement</Heading>
        <Text style={text}>
          Un membre vient de signaler {labelForTarget(targetType)} sur {SITE_NAME}.
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>Motif</Text>
          <Text style={cardValue}>{labelForReason(reason)}</Text>

          {details && (
            <>
              <Text style={cardLabel}>Détails</Text>
              <Text style={cardQuote}>« {details} »</Text>
            </>
          )}

          <Text style={cardLabel}>Cible</Text>
          <Text style={cardValueSmall}>{labelForTarget(targetType)} · {targetId || '—'}</Text>

          {reporterName && (
            <>
              <Text style={cardLabel}>Signalé par</Text>
              <Text style={cardValue}>{reporterName}</Text>
            </>
          )}
          {submittedAt && (
            <>
              <Text style={cardLabel}>Le</Text>
              <Text style={cardValue}>{submittedAt}</Text>
            </>
          )}
        </Section>

        <Text style={text}>
          <Link href={`${SITE_URL}/admin/reports`} style={link}>Voir dans l'espace de modération →</Link>
        </Text>

        <Text style={footer}>{SITE_NAME} — modération</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReportReceivedEmail,
  subject: (d: any) => `🚩 Signalement (${labelForReason(d?.reason)}) — ${SITE_NAME}`,
  displayName: 'Signalement reçu (admin)',
  previewData: {
    targetType: 'listing',
    targetId: 'd2000000-0000-4000-8000-000000000002',
    reason: 'inappropriate_content',
    details: 'Les photos ne correspondent pas au lieu décrit.',
    reporterName: 'Awa Diop',
    submittedAt: '5 juin 2026, 14:32',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 25px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px', fontWeight: 'bold' as const,
  fontFamily: "'Playfair Display', Georgia, serif",
  color: '#2e2623', margin: '0 0 18px',
}
const text = { fontSize: '14px', color: '#81746e', lineHeight: '1.6', margin: '0 0 22px' }
const card = { backgroundColor: '#fbf7f4', borderRadius: '12px', padding: '18px 20px', margin: '0 0 24px' }
const cardLabel = {
  fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px',
  color: '#a89890', margin: '12px 0 2px', fontWeight: '600' as const,
}
const cardValue = { fontSize: '14px', color: '#2e2623', margin: '0 0 4px', lineHeight: '1.5' }
const cardValueSmall = { fontSize: '12px', color: '#5e524d', margin: '0 0 4px', lineHeight: '1.4', wordBreak: 'break-all' as const }
const cardQuote = { fontSize: '14px', color: '#2e2623', fontStyle: 'italic' as const, margin: '0 0 8px', lineHeight: '1.6' }
const link = { color: '#c1502e', textDecoration: 'underline' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', lineHeight: '1.6' }
